import {
  computed,
  inject,
  Injectable,
  signal,
  type Signal,
} from '@angular/core';
import { CategoryEnum } from '@app/constants';
import {
  createPortfolioId,
  type PortfolioDraft,
  type PortfolioItem,
} from '@entities/portfolio-item/portfolio-item.model';
import { PortfolioRepository } from '@entities/portfolio-item/portfolio-item.repository';
import {
  firstIssueMessage,
  parseDraft,
  portfolioListSchema,
} from '@entities/portfolio-item/portfolio-item.schema';

export type PortfolioAdminStatus =
  | 'idle'
  | 'loading'
  | 'saving'
  | 'saved'
  | 'error';

/** How long the transient "SAVED" confirmation stays lit before returning to idle. */
const SAVED_FLASH_MS = 2200;

function byOrder(a: PortfolioItem, b: PortfolioItem): number {
  return a.order - b.order;
}

/** Renumbers `order` per category so it always equals the visible index. */
function normalizeOrder(items: PortfolioItem[]): PortfolioItem[] {
  return Object.values(CategoryEnum).flatMap((category) =>
    items
      .filter((item) => item.category === category)
      .sort(byOrder)
      .map((item, index) => ({ ...item, order: index })),
  );
}

/**
 * CQRS facade over the portfolio aggregate.
 *
 * Queries are exposed exclusively as readonly signals; commands are the only way to
 * change state. Components never hold application state of their own (CLAUDE.md rule 3)
 * — they read the signals below and call the methods below.
 */
@Injectable({ providedIn: 'root' })
export class PortfolioAdminStore {
  private readonly repository = inject(PortfolioRepository);

  private readonly _items = signal<PortfolioItem[]>([]);
  /** Last persisted state — the reference point for isDirty and discard(). */
  private readonly _baseline = signal<PortfolioItem[]>([]);
  private readonly _selectedId = signal<string | null>(null);
  private readonly _newDraftCategory = signal<CategoryEnum | null>(null);
  private readonly _status = signal<PortfolioAdminStatus>('idle');
  private readonly _error = signal<string | null>(null);

  private savedFlashTimer: ReturnType<typeof setTimeout> | undefined;

  // ───────────────────────── Queries ─────────────────────────

  public readonly items: Signal<readonly PortfolioItem[]> =
    this._items.asReadonly();
  public readonly status = this._status.asReadonly();
  public readonly error = this._error.asReadonly();
  public readonly selectedId = this._selectedId.asReadonly();

  public readonly horizontal = computed(() =>
    this._items()
      .filter((item) => item.category === CategoryEnum.Horizontal)
      .sort(byOrder),
  );

  public readonly vertical = computed(() =>
    this._items()
      .filter((item) => item.category === CategoryEnum.Vertical)
      .sort(byOrder),
  );

  /** The clip currently loaded into the form, or `null` when the form is closed. */
  public readonly selected = computed(
    () => this._items().find((item) => item.id === this._selectedId()) ?? null,
  );

  /** Category of the clip being created, or `null` when not creating. */
  public readonly newDraftCategory = this._newDraftCategory.asReadonly();

  public readonly isEditing = computed(
    () => this._selectedId() !== null || this._newDraftCategory() !== null,
  );

  public readonly total = computed(() => this._items().length);

  public readonly backgroundCount = computed(
    () => this._items().filter((item) => item.asBackground).length,
  );

  // use JSON comparison because the aggregate is a small array of flat objects — deep
  // equality here is cheaper and far less error-prone than tracking a dirty flag per command
  public readonly isDirty = computed(
    () => JSON.stringify(this._items()) !== JSON.stringify(this._baseline()),
  );

  public readonly isBusy = computed(
    () => this._status() === 'loading' || this._status() === 'saving',
  );

  // ───────────────────────── Commands ─────────────────────────

  /** Idempotent: repeated calls (e.g. re-entering the route) do not refetch. */
  public async load(): Promise<void> {
    if (this._status() === 'loading' || this._items().length > 0) return;

    this._status.set('loading');
    this._error.set(null);
    try {
      const items = normalizeOrder(await this.repository.load());
      this._items.set(items);
      this._baseline.set(structuredClone(items));
      this._status.set('idle');
    } catch {
      this._status.set('error');
      this._error.set('Could not load the portfolio');
    }
  }

  public select(id: string): void {
    this._newDraftCategory.set(null);
    this._selectedId.set(id);
    this._error.set(null);
  }

  public startNew(category: CategoryEnum): void {
    this._selectedId.set(null);
    this._newDraftCategory.set(category);
    this._error.set(null);
  }

  public closeEditor(): void {
    this._selectedId.set(null);
    this._newDraftCategory.set(null);
    this._error.set(null);
  }

  /** Creates the clip when `draft.id` is absent, updates it otherwise. */
  public upsert(draft: PortfolioDraft): void {
    const parsed = parseDraft(draft);
    if (!parsed.ok) {
      this.fail(parsed.error);
      return;
    }
    const valid = parsed.data;

    const existing = valid.id
      ? this._items().find((item) => item.id === valid.id)
      : undefined;

    // mint the id up front so the clip can be re-selected after the aggregate is applied
    const targetId = existing?.id ?? createPortfolioId();

    const next = existing
      ? this._items().map((item) =>
          item.id === existing.id
            ? { ...item, ...valid, id: existing.id, order: item.order }
            : item,
        )
      : [
          ...this._items(),
          {
            ...valid,
            id: targetId,
            order: this.nextOrder(valid.category),
          },
        ];

    if (!this.applyIfValid(next)) return;

    // keep the just-saved clip selected so the editor stays on it
    this._newDraftCategory.set(null);
    this._selectedId.set(targetId);
  }

  public remove(id: string): void {
    const next = normalizeOrder(this._items().filter((item) => item.id !== id));
    if (!this.applyIfValid(next)) return;

    if (this._selectedId() === id) this._selectedId.set(null);
  }

  /** Moves a clip by `delta` positions within its own category. */
  public move(id: string, delta: number): void {
    const item = this._items().find((entry) => entry.id === id);
    if (!item) return;

    const siblings = this._items()
      .filter((entry) => entry.category === item.category)
      .sort(byOrder);

    const from = siblings.findIndex((entry) => entry.id === id);
    const to = from + delta;
    if (to < 0 || to >= siblings.length) return;

    const reordered = [...siblings];
    reordered.splice(to, 0, ...reordered.splice(from, 1));

    const positions = new Map(
      reordered.map((entry, index) => [entry.id, index]),
    );
    const next = this._items().map((entry) =>
      positions.has(entry.id)
        ? { ...entry, order: positions.get(entry.id)! }
        : entry,
    );

    this.applyIfValid(next);
  }

  public toggleBackground(id: string): void {
    const next = this._items().map((item) =>
      item.id === id ? { ...item, asBackground: !item.asBackground } : item,
    );

    const target = next.find((item) => item.id === id);
    if (target?.asBackground && target.category !== CategoryEnum.Horizontal) {
      this.fail('Only horizontal clips can be used as background');
      return;
    }

    this.applyIfValid(next);
  }

  public async commit(): Promise<void> {
    if (!this.isDirty() || this.isBusy()) return;

    this._status.set('saving');
    this._error.set(null);
    try {
      const items = this._items();
      await this.repository.save(items);
      this._baseline.set(structuredClone(items));
      this._status.set('saved');
      this.scheduleSavedFlashReset();
    } catch {
      this._status.set('error');
      this._error.set('Could not save changes');
    }
  }

  public discard(): void {
    this._items.set(structuredClone(this._baseline()));
    this.closeEditor();
    this._status.set('idle');
  }

  public clearError(): void {
    this._error.set(null);
    if (this._status() === 'error') this._status.set('idle');
  }

  // ───────────────────────── Internals ─────────────────────────

  /** Commits `next` only if the whole aggregate still satisfies its invariants. */
  private applyIfValid(next: PortfolioItem[]): boolean {
    const result = portfolioListSchema.safeParse(next);
    if (!result.success) {
      this.fail(firstIssueMessage(result.error));
      return false;
    }
    this._items.set(normalizeOrder(next));
    this._error.set(null);
    if (this._status() === 'error' || this._status() === 'saved') {
      this._status.set('idle');
    }
    return true;
  }

  private fail(message: string): void {
    this._error.set(message);
    this._status.set('error');
  }

  private nextOrder(category: CategoryEnum): number {
    return this._items().filter((item) => item.category === category).length;
  }

  private scheduleSavedFlashReset(): void {
    clearTimeout(this.savedFlashTimer);
    this.savedFlashTimer = setTimeout(() => {
      if (this._status() === 'saved') this._status.set('idle');
    }, SAVED_FLASH_MS);
  }
}
