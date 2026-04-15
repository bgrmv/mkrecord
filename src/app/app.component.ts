import { PlatformModule } from '@angular/cdk/platform';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  OnInit,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { YouTubePlayer } from '@angular/youtube-player';
import { FooterComponent } from '@core/footer.component';
import { HeaderComponent } from '@core/header.component';
import { NavMobileComponent } from '@core/nav-mobile.component';
import { CameraOverlayComponent } from '@features/camera-overlay/camera-overlay.component';
import { CursorComponent } from '@features/cursor/cursor.component';
import { BackgroundService } from '@services/background-service';
import { IconService } from '@services/icon.service';
import { PlatformService } from '@services/platform.service';
import { SafePipe } from '@shared/pipes/safe.pipe';
import { DeviceDetectorService } from 'ngx-device-detector';
import { filter, skip } from 'rxjs';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    MatIconModule,
    HeaderComponent,
    FooterComponent,
    NavMobileComponent,
    CameraOverlayComponent,
    CursorComponent,
    SafePipe,
    YouTubePlayer,
    PlatformModule,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [SafePipe, IconService, DeviceDetectorService, BackgroundService], // see docs/todo — P1 #11: IconService provided here AND in footer.component.ts, violates singleton; see docs/todo/tech-debt.md#singleton-violations
})
export class AppComponent implements OnInit {
  #destroyRef = inject(DestroyRef); // see docs/todo — P1 #7: duplicate DestroyRef; this one is unused, delete it; see docs/todo/tech-debt.md#destroyref-duplicate
  #router = inject(Router);
  #safePipe = inject(SafePipe);
  private readonly platformService = inject(PlatformService);
  private readonly backgroundService = inject(BackgroundService);
  private readonly iconService = inject(IconService);

  private readonly destroyRef = inject(DestroyRef); // see docs/todo — P1 #7: duplicate of #destroyRef above; keep only this one

  protected readonly backgroundVideoSrc = this.backgroundService.videoSrc;
  protected readonly nextVideoSrc = this.backgroundService.nextVideoSrc;

  private readonly _video = viewChild<ElementRef<HTMLVideoElement>>('video');
  protected readonly isMobile = this.platformService.isMobile;

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

  // see docs/todo/angular-modern-api.md — B3: use afterNextRender() because the entire body is guarded by isBrowser — afterNextRender() does this automatically
  ngOnInit() {
    if (this.platformService.isBrowser) {
      this.initPhoneEvents();
    }
  }

  private initPhoneEvents() {
    this.#router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        skip(1),
        takeUntilDestroyed(this.destroyRef),
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
