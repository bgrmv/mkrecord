import { NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { Subject, interval } from 'rxjs';

import { PlatformService } from '../../services/platform.service';
import { PORTFOLIO_TIMELINE_LIST } from './constants';

@Component({
  selector: 'app-portfolio-timeline',
  imports: [MatIconModule, NgOptimizedImage],
  templateUrl: './portfolio-timeline.component.html',
  styleUrl: './portfolio-timeline.component.css',
  providers: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfolioTimelineComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformService = inject(PlatformService);

  activePreview = signal<number>(0);
  timelineImage = computed(() => {
    const index = this.activePreview();
    const portfolio = PORTFOLIO_TIMELINE_LIST[index];
    const preview = portfolio?.preview;
    console.log(index, portfolio, preview);
    return preview;
  });

  readonly portfolioList = PORTFOLIO_TIMELINE_LIST;

  private readonly unsubscribe = new Subject<void>(); // see docs/todo — P2 #15 / deprecated.md — Subject declared but never used, delete

  // see docs/todo/angular-modern-api.md — C3: use constructor + afterNextRender() — same as C1; interval should also move to PortfolioTimelineService (CQRS C4)
  ngOnInit() {
    if (this.platformService.isBrowser) {
      // see docs/todo/tech-debt.md#cqrs--state-ownership-violations — C4: rotation interval and activePreview mutation should move to PortfolioService
      interval(5000)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.activePreview.update((currentIndex) => {
            if (currentIndex === PORTFOLIO_TIMELINE_LIST.length - 1) {
              return 0;
            }
            return currentIndex + 1;
          });
        });
    }
  }
}
