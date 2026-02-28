import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  PLATFORM_ID,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, skip } from 'rxjs';
import { HeaderComponent } from './core/header.component';
import { CameraBatteryComponent } from './features/camera-battery/camera-battery.component';
import { CameraTimerComponent } from './features/camera-timer/camera-timer.component';

import { SafePipe } from './shared/pipes/safe.pipe';

import { PlatformModule } from '@angular/cdk/platform';
import { NavMobileComponent } from './core/nav-mobile.component';
import { CameraQualityResolutionComponent } from './features/camera-quality-resolution.component';
import { IconService } from './services/icon.service';

import { YouTubePlayer } from '@angular/youtube-player';
import { DeviceDetectorService } from 'ngx-device-detector';
import { FooterComponent } from './core/footer.component';
import { CameraCornersLayerComponent } from './features/camera-corners-layer.component';
import { BackgroundService } from './services/background-service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    MatIconModule,
    HeaderComponent,
    FooterComponent,
    NavMobileComponent,
    CameraTimerComponent,
    CameraBatteryComponent,
    CameraQualityResolutionComponent,
    SafePipe,
    YouTubePlayer,
    PlatformModule,
    CameraCornersLayerComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [SafePipe, IconService, DeviceDetectorService, BackgroundService],
})
export class AppComponent {
  #destroyRef = inject(DestroyRef);
  #router = inject(Router);
  #safePipe = inject(SafePipe);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly backgroundService = inject(BackgroundService);
  private readonly iconService = inject(IconService);

  private readonly destroyRef = inject(DestroyRef);

  protected readonly backgroundIsActive = this.backgroundService.isActive;
  protected readonly backgroundVideoSrc = this.backgroundService.videoSrc;

  private readonly _video = viewChild<ElementRef<HTMLVideoElement>>('video');

  constructor() {
    effect(() => {
      const src = this.backgroundVideoSrc();

      untracked(() => {
        const video = this._video()?.nativeElement;

        if (!src || !video) return;

        // ensureBackgroundPlay(video).catch(e =>
        //   console.warn('ensureBackgroundPlay failed', e)
        // );
      });
    });
  }

  activePreview = signal<number>(0);
  // timelineImage = computed(() => {
  //   const index = this.activePreview();
  //   const portfolio = PORTFOLIO_TIMELINE_LIST[index];
  //   const preview = portfolio?.preview;
  //   console.log(index, portfolio, preview);
  //   return preview;
  // });

  // readonly portfolioList = PORTFOLIO_TIMELINE_LIST;

  // private readonly _video = viewChild<ElementRef<HTMLVideoElement>>('video');
  // private readonly video$ = toObservable(this.videoBackground).pipe(
  //   filter(Boolean),
  //   filter(() => !!this._video()),
  //   filter(() => isPlatformBrowser(this.platformId)),
  //   // take(1),
  //   takeUntilDestroyed(this.destroyRef)
  // );

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initPhoneEvents();
      // this.backgroundService.init();
    }

    // this.video$.subscribe(() => {
    //   const video = this._video()!;
    //   console.log('Video element available');
    //   if (isPlatformBrowser(this.platformId)) {
    //     console.log(video, this.videoBackground().isOn);
    //     if (video.nativeElement) {
    //       video.nativeElement.playbackRate = 0.25;
    //       console.log(
    //         'Set playback rate',
    //         video.nativeElement,
    //         video.nativeElement.playbackRate
    //       );
    //     }
    //   }
    // });
  }

  private initPhoneEvents() {
    this.#router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        skip(1),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.triggerVibration();
      });
  }

  private triggerVibration() {
    if (typeof navigator !== 'undefined' && navigator?.vibrate) {
      navigator.vibrate(100);
    } else {
      console.warn('Vibration API is not supported');
    }
  }
}
