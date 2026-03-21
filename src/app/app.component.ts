import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  inject,
  PLATFORM_ID,
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
  providers: [SafePipe, IconService, DeviceDetectorService, BackgroundService], // see docs/todo — P1 #11: IconService provided here AND in footer.component.ts, violates singleton; see docs/todo/tech-debt.md#singleton-violations
})
export class AppComponent {
  #destroyRef = inject(DestroyRef); // see docs/todo — P1 #7: duplicate DestroyRef; this one is unused, delete it; see docs/todo/tech-debt.md#destroyref-duplicate
  #router = inject(Router);
  #safePipe = inject(SafePipe);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly backgroundService = inject(BackgroundService);
  private readonly iconService = inject(IconService);

  private readonly destroyRef = inject(DestroyRef); // see docs/todo — P1 #7: duplicate of #destroyRef above; keep only this one

  protected readonly backgroundVideoSrc = this.backgroundService.videoSrc;

  private readonly _video = viewChild<ElementRef<HTMLVideoElement>>('video');

  constructor() {
    // TODO
    // effect(() => {
    //   const src = this.backgroundVideoSrc();
    //   untracked(() => {
    //     const video = this._video()?.nativeElement;
    //     if (!src || !video) return;
    //     ensureBackgroundPlay(video).catch(e =>
    //       console.warn('ensureBackgroundPlay failed', e)
    //     );
    //   });
    // });
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) { // see docs/todo/tech-debt.md#platform-service — replace with inject(PlatformService).isBrowser
      this.initPhoneEvents();
    }
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
