import { NgOptimizedImage } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  OnDestroy,
  viewChildren,
} from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CategoryEnum } from '@app/constants';
import { VideoDialogComponent } from '@core/video-dialog.component';
import { PlatformService } from '@services/platform.service';
import { PortfolioCategory } from '@app/types';

@Component({
  selector: 'app-portfolio-block',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatIconModule,
    NgOptimizedImage,
    MatButtonToggleModule,
    MatCheckboxModule,
  ],
  providers: [],
  templateUrl: './portfolio-block.component.html',
  styleUrl: './portfolio-block.component.css',
})
export class PortfolioBlockComponent implements OnDestroy, AfterViewInit {
  private readonly dialog = inject(MatDialog);
  private readonly platformService = inject(PlatformService);

  public readonly portfolios = input.required<PortfolioCategory[]>();
  public readonly gridView = input.required<string>();
  public readonly category = input.required<CategoryEnum>();
  protected readonly categoryEnum = CategoryEnum;

  videos = viewChildren<ElementRef<HTMLVideoElement>>('video');

  private observer: IntersectionObserver | null = null;

  // see docs/todo/angular-modern-api.md — B1: use afterNextRender() because it's SSR-safe by design and replaces both ngAfterViewInit + isBrowser guard; use DestroyRef.onDestroy() instead of ngOnDestroy
  ngAfterViewInit() {
    // use PlatformService.isBrowser because video playback, playbackRate, and IntersectionObserver
    // are browser-only APIs not available during SSR
    if (!this.platformService.isBrowser) return;

    this.videos().forEach((videoRef) => {
      videoRef.nativeElement.playbackRate = 0.5;
    });

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const video = entry.target as HTMLVideoElement;
        if (entry.isIntersecting) {
          video.play().catch((e) => {
            console.error('Video play failed', e);
          });
        } else {
          video.pause();
        }
      });
    });

    this.videos().forEach((videoRef) => {
      this.observer!.observe(videoRef.nativeElement);
    });
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }

  protected onVideoReady(event: Event) {
    (event.target as HTMLVideoElement).classList.add('loaded');
  }

  openDialog(portfolio: PortfolioCategory): void {
    const dialogRef = this.dialog.open(VideoDialogComponent, {
      data: {
        // url: 'GST8we5uABo',
        ...portfolio,
      },
      minWidth: 'max-content',
      maxHeight: 'max-content',
      // width: 640,
      // height: 390,
      hasBackdrop: true,
      backdropClass: 'backdrop-dialog',
      enterAnimationDuration: 200,
      exitAnimationDuration: 200,
      closeOnNavigation: true,
    });

    // see docs/todo/tech-debt.md#cqrs--state-ownership-violations — C3: dialog state should be managed by a service; also missing takeUntilDestroyed
    dialogRef.afterClosed().subscribe(() => {
      console.log('The dialog was closed'); // see docs/todo/deprecated.md#consolelog-pollution — remove
    });
  }
}
