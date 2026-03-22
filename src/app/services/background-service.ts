import { inject, Injectable, PLATFORM_ID, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { delay, filter, interval, map, share, startWith } from 'rxjs';
import { CategoryEnum, portfolios } from '../constants';

const backgroundVideos = portfolios[CategoryEnum.Horizontal].filter(
  (video) => video.asBackground,
);

// see docs/todo — P0 #6: while(true) loop hangs if all videos share the same preview src; see docs/todo/tech-debt.md#ssr-safety
const getRandomVideoSrc = (localVideoSrc?: SafeResourceUrl): string => {
  while (true) {
    const randomIdx = Math.floor(Math.random() * backgroundVideos.length);

    if (backgroundVideos[randomIdx].preview === localVideoSrc) {
      continue;
    }

    console.log(
      // see docs/todo/deprecated.md#consolelog-pollution — remove
      'Selected background video:',
      backgroundVideos[randomIdx].preview,
    );
    return backgroundVideos[randomIdx].preview;
  }
};

@Injectable({
  providedIn: 'root',
})
export class BackgroundService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  private readonly sanitizer = inject(DomSanitizer);

  public readonly hasBackgroundVideos: Signal<boolean> = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((url) => (url instanceof NavigationEnd ? url.url : '')),
      map((url) => !url.includes('portfolio')),
      // map(() => false) // see docs/todo/deprecated.md#servicesbackground-servicets — dead commented code, delete
    ),
    { initialValue: false },
  );

  private readonly videoRotation$ = interval(5000).pipe(
    filter(() => this.hasBackgroundVideos()),
    map(() => getRandomVideoSrc(this.videoSrc())),
    startWith(getRandomVideoSrc()),
    share(),
  );

  public readonly videoSrc: Signal<SafeResourceUrl | undefined> = toSignal(
    this.videoRotation$.pipe(
      map((src) => this.sanitizer.bypassSecurityTrustResourceUrl(src)),
    ),
    { initialValue: undefined },
  );

  /** Next video URL, emitted 2 s before the swap to begin buffering. */
  public readonly nextVideoSrc: Signal<SafeResourceUrl | undefined> = toSignal(
    this.videoRotation$.pipe(
      map(() => getRandomVideoSrc(this.videoSrc())),
      delay(3000),
      map((src) => this.sanitizer.bypassSecurityTrustResourceUrl(src)),
    ),
    { initialValue: undefined },
  );
}
