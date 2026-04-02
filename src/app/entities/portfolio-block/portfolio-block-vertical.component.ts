import {
  animate,
  query,
  stagger,
  style,
  transition,
  trigger,
} from '@angular/animations';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  OnDestroy,
  signal,
  viewChildren,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PortfolioCategory } from '@app/types';
import { VideoDialogComponent } from '@core/video-dialog.component';


const fadeInUp = trigger('fadeInUp', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(14px)' }),
    animate(
      '550ms cubic-bezier(0.16, 0.84, 0.3, 1)',
      style({ opacity: 1, transform: 'translateY(0)' }),
    ),
  ]),
]);

const staggerGrid = trigger('staggerGrid', [
  transition('* => *', [
    query(
      ':enter',
      [
        style({ opacity: 0, transform: 'translateY(16px) scale(0.96)' }),
        stagger(70, [
          animate(
            '480ms cubic-bezier(0.16, 0.84, 0.3, 1)',
            style({ opacity: 1, transform: 'translateY(0) scale(1)' }),
          ),
        ]),
      ],
      { optional: true },
    ),
  ]),
]);

@Component({
  selector: 'app-portfolio-block-vertical',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  animations: [fadeInUp, staggerGrid],
  templateUrl: './portfolio-block-vertical.component.html',
  styleUrl: './portfolio-block-vertical.component.css',
})
export class PortfolioBlockVerticalComponent implements OnDestroy {
  private readonly dialog = inject(MatDialog);

  public readonly portfolios = input.required<PortfolioCategory[]>();
  public readonly gridView = input.required<string>();
  public readonly slotMode = input<boolean>(false);

  videos = viewChildren<ElementRef<HTMLVideoElement>>('video');
  laneRefs = viewChildren<ElementRef<HTMLElement>>('lane');

  private observer: IntersectionObserver | null = null;

  private readonly laneIntervals = [2200, 2800, 3400];
  private intervalIds: ReturnType<typeof setInterval>[] = [];
  private pausedLanes = new Set<number>();
  private autoScrollingLanes = new Set<number>();
  private resumeTimeouts = new Map<number, ReturnType<typeof setTimeout>>();
  private scrollListeners: (() => void)[] = [];

  protected readonly scrollHints = signal([true, true, true]);

  // use computed() because derived state — splits portfolios into 3 lanes, duplicated for seamless loop
  protected readonly lanes = computed(() => {
    const items = this.portfolios();
    const groups: PortfolioCategory[][] = [[], [], []];
    items.forEach((item, i) => groups[i % 3].push(item));
    return groups.map((g) => [...g, ...g]);
  });

  // use afterNextRender() because it's SSR-safe by design and runs after DOM paint
  constructor() {
    afterNextRender(() => this.bootstrap());
  }

  // use bootstrap retry because matTabContent projects the template asynchronously;
  // viewChildren may be empty when afterNextRender first fires
  private bootstrap(): void {
    if (this.videos().length === 0) {
      requestAnimationFrame(() => this.bootstrap());
      return;
    }

    this.videos().forEach((ref) => {
      ref.nativeElement.playbackRate = 0.5;
    });

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const video = entry.target as HTMLVideoElement;
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    });

    this.videos().forEach((ref) => {
      this.observer!.observe(ref.nativeElement);
    });

    if (this.slotMode()) {
      this.waitForLanes();
    }
  }

  ngOnDestroy() {
    this.observer?.disconnect();
    this.stopAutoScroll();
    this.resumeTimeouts.forEach((t) => clearTimeout(t));
    this.scrollListeners.forEach((fn) => fn());
  }

  private initRetries = 0;

  // use 700ms delay because Material tab animation is 600ms;
  // DOM dimensions aren't stable until animation completes
  private waitForLanes(): void {
    setTimeout(() => this.pollLanes(), 700);
  }

  private pollLanes(): void {
    const lanes = this.laneRefs();
    const firstLane = lanes.length > 0 ? lanes[0].nativeElement : null;

    if (
      !firstLane ||
      (firstLane.clientHeight === 0 && firstLane.clientWidth === 0)
    ) {
      if (this.initRetries++ < 20) {
        setTimeout(() => this.pollLanes(), 200);
      }
      return;
    }

    this.initLanes();
  }

  private initLanes(): void {
    const lanes = this.laneRefs().map((r) => r.nativeElement);

    lanes.forEach((el, i) => {
      let scrollTimer: ReturnType<typeof setTimeout>;
      const onScroll = () => {
        if (this.autoScrollingLanes.has(i)) return;

        this.pausedLanes.add(i);
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
          this.pausedLanes.delete(i);
        }, 3000);

        this.updateHint(i, false);
      };

      el.addEventListener('scroll', onScroll, { passive: true });
      this.scrollListeners.push(() =>
        el.removeEventListener('scroll', onScroll),
      );

      const hasOverflow = el.scrollHeight > el.clientHeight + 10;

      if (!hasOverflow) {
        this.updateHint(i, false);
        return;
      }

      this.startLaneAutoScroll(el, i);
    });
  }

  private startLaneAutoScroll(el: HTMLElement, index: number): void {
    const firstCard = el.firstElementChild as HTMLElement;
    if (!firstCard) return;

    const gap = 8;
    const cardSize = firstCard.offsetHeight;
    if (cardSize === 0) return;

    const step = Math.round(cardSize + gap);
    const originalCount = this.lanes()[index].length / 2;
    const resetAt = originalCount * step;

    const id = setInterval(() => {
      if (this.pausedLanes.has(index)) return;
      // skip scroll when element is hidden (e.g. inactive tab) to prevent state corruption
      if (!el.isConnected || el.offsetParent === null) return;

      const pos = el.scrollTop;
      const target = pos + step;

      this.autoScrollingLanes.add(index);

      el.scrollTo({ top: target, behavior: 'smooth' });

      setTimeout(() => {
        this.autoScrollingLanes.delete(index);

        const newPos = el.scrollTop;
        if (newPos >= resetAt - 5) {
          this.autoScrollingLanes.add(index);
          el.scrollTo({
            top: newPos - resetAt,
            behavior: 'instant' as ScrollBehavior,
          });
          requestAnimationFrame(() => {
            this.autoScrollingLanes.delete(index);
          });
        }
      }, 650);
    }, this.laneIntervals[index]);

    this.intervalIds.push(id);
  }

  private stopAutoScroll(): void {
    this.intervalIds.forEach((id) => clearInterval(id));
    this.intervalIds = [];
  }

  private updateHint(index: number, visible: boolean): void {
    const hints = [...this.scrollHints()];
    hints[index] = visible;
    this.scrollHints.set(hints);
  }

  protected onLaneEnter(index: number): void {
    this.pausedLanes.add(index);
    const existing = this.resumeTimeouts.get(index);
    if (existing) clearTimeout(existing);
  }

  protected onLaneLeave(index: number): void {
    const timeout = setTimeout(() => {
      this.pausedLanes.delete(index);
      this.resumeTimeouts.delete(index);
    }, 3000);
    this.resumeTimeouts.set(index, timeout);
  }

  protected onVideoReady(event: Event): void {
    (event.target as HTMLVideoElement).classList.add('loaded');
  }

  // use pointerdown+click distance check because drag-to-scroll
  // would otherwise trigger the dialog open on mouseup
  private lastPointerDown = { x: 0, y: 0 };

  protected onPointerDown(event: PointerEvent): void {
    this.lastPointerDown = { x: event.clientX, y: event.clientY };
  }

  protected openDialog(portfolio: PortfolioCategory, event: MouseEvent): void {
    const dx = Math.abs(event.clientX - this.lastPointerDown.x);
    const dy = Math.abs(event.clientY - this.lastPointerDown.y);
    if (dx > 5 || dy > 5) return;
    this.dialog.open(VideoDialogComponent, {
      panelClass: 'video-dialog',
      data: { ...portfolio },
      minWidth: 'max-content',
      maxHeight: 'max-content',
      hasBackdrop: true,
      backdropClass: 'backdrop-dialog',
      enterAnimationDuration: 200,
      exitAnimationDuration: 200,
      closeOnNavigation: true,
    });
  }
}
