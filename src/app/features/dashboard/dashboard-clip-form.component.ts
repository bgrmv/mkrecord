import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { CategoryEnum } from '@app/constants';
import {
  createEmptyDraft,
  PREVIEW_ROOT,
  YOUTUBE_ID_PATTERN,
  youTubeThumbnail,
  type PortfolioDraft,
  type PortfolioItem,
} from '@entities/portfolio-item/portfolio-item.model';
import { PlatformService } from '@services/platform.service';

/**
 * The "slate": one clip loaded into an editable clapperboard.
 *
 * Validators here mirror the zod schema for immediate inline feedback; the schema in
 * `@entities/portfolio-item` remains the authority — the store re-validates every draft
 * before it touches the aggregate, so a divergence can never corrupt data.
 */
@Component({
  selector: 'app-dashboard-clip-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatIconModule,
  ],
  templateUrl: './dashboard-clip-form.component.html',
  styleUrl: './dashboard-clip-form.component.css',
})
export class DashboardClipFormComponent {
  private readonly platform = inject(PlatformService);

  public readonly item = input<PortfolioItem | null>(null);
  public readonly draftCategory = input<CategoryEnum | null>(null);
  public readonly busy = input(false);

  public readonly save = output<PortfolioDraft>();
  // named cancelEdit, not cancel: `cancel` is a native DOM event name
  // (@angular-eslint/no-output-native)
  public readonly cancelEdit = output<void>();
  public readonly remove = output<string>();

  protected readonly categories = [
    CategoryEnum.Horizontal,
    CategoryEnum.Vertical,
  ];
  protected readonly isBrowser = this.platform.isBrowser;

  /** Two-step delete instead of MatDialog — the dialog component is not themed. */
  protected readonly confirmingDelete = signal(false);

  // see docs/todo/angular-modern-api.md — H1: migrate to signal-based forms when Angular stabilizes them
  protected readonly form = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(120),
      ],
    }),
    videoId: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(YOUTUBE_ID_PATTERN)],
    }),
    preview: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    category: new FormControl<CategoryEnum>(CategoryEnum.Horizontal, {
      nonNullable: true,
    }),
    asBackground: new FormControl(false, { nonNullable: true }),
  });

  // use toSignal over the control streams because the preview player and the YouTube
  // still must track what is typed, without a manual subscribe → signal.set() bridge
  private readonly previewValue = toSignal(
    this.form.controls.preview.valueChanges,
    {
      initialValue: '',
    },
  );
  private readonly videoIdValue = toSignal(
    this.form.controls.videoId.valueChanges,
    {
      initialValue: '',
    },
  );
  private readonly categoryValue = toSignal(
    this.form.controls.category.valueChanges,
    {
      initialValue: CategoryEnum.Horizontal,
    },
  );

  protected readonly isNew = computed(() => this.item() === null);

  protected readonly previewSrc = computed(() => {
    const value = this.previewValue().trim();
    return value.endsWith('.webm') ? value : null;
  });

  protected readonly thumbnailSrc = computed(() => {
    const value = this.videoIdValue().trim();
    return YOUTUBE_ID_PATTERN.test(value) ? youTubeThumbnail(value) : null;
  });

  protected readonly previewRoot = computed(
    () => PREVIEW_ROOT[this.categoryValue()],
  );

  protected readonly backgroundAllowed = computed(
    () => this.categoryValue() === CategoryEnum.Horizontal,
  );

  public constructor() {
    // reload the form whenever the store hands over a different clip (or a blank draft);
    // an effect keeps this reactive without an ngOnChanges lifecycle hook
    effect(() => {
      const source = this.item();
      const draft =
        source ??
        createEmptyDraft(this.draftCategory() ?? CategoryEnum.Horizontal);

      this.form.reset({
        title: draft.title,
        videoId: draft.videoId,
        preview: draft.preview,
        category: draft.category,
        asBackground: draft.asBackground,
      });
      this.confirmingDelete.set(false);
    });
  }

  /** Rewrites the asset root so switching category cannot leave a mismatched path behind. */
  protected onCategoryChange(category: CategoryEnum): void {
    const current = this.form.controls.preview.value;
    const filename = current.slice(current.lastIndexOf('/') + 1);
    this.form.controls.preview.setValue(
      `${PREVIEW_ROOT[category]}/${filename}`,
    );

    if (category !== CategoryEnum.Horizontal) {
      this.form.controls.asBackground.setValue(false);
    }
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();

    if (this.form.invalid) {
      // mat-error only renders on touched controls — reveal everything at once
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.save.emit({ ...value, id: this.item()?.id });
  }

  protected onDelete(): void {
    const id = this.item()?.id;
    if (!id) return;

    if (!this.confirmingDelete()) {
      this.confirmingDelete.set(true);
      return;
    }
    this.remove.emit(id);
  }
}
