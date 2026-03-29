import { inject, Injectable, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { CategoryEnum, portfolios } from '@app/constants';
import { browserInterval } from '@shared/utils/ssr-rxjs';
import { delay, filter, map, share, startWith } from 'rxjs';
import { PlatformService } from './platform.service';

const backgroundVideos = portfolios[CategoryEnum.Horizontal].filter(
  (video) => video.asBackground,
);

// see docs/todo — P0 #6: while(true) loop hangs if all videos share the same preview src; see docs/todo/tech-debt.md#ssr-safety
const getRandomVideoSrc = (currentSrc?: string): string => {
  while (true) {
    const randomIdx = Math.floor(Math.random() * backgroundVideos.length);

    if (backgroundVideos[randomIdx].preview === currentSrc) {
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
  private readonly platform = inject(PlatformService);
  private readonly router = inject(Router);

  private currentRawSrc?: string;

  public readonly hasBackgroundVideos: Signal<boolean> = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((url) => (url instanceof NavigationEnd ? url.url : '')),
      map((url) => !url.includes('portfolio')),
    ),
    { initialValue: false },
  );

  // use browserInterval because bare interval() creates an uncleanable timer leak during SSR
  private readonly videoRotation$ = browserInterval(this.platform, 5000).pipe(
    filter(() => this.hasBackgroundVideos()),
    map(() => {
      const src = getRandomVideoSrc(this.currentRawSrc);
      this.currentRawSrc = src;
      return src;
    }),
    startWith(
      (() => {
        const src = getRandomVideoSrc();
        this.currentRawSrc = src;
        return src;
      })(),
    ),
    share(),
  );

  // use string instead of SafeResourceUrl because video src values come from static constants,
  // not user input — bypassSecurityTrustResourceUrl is unnecessary and its toString()
  // triggers spurious NG04002 router navigation during SSR
  public readonly videoSrc: Signal<string | undefined> = toSignal(
    this.videoRotation$,
    { initialValue: undefined },
  );

  /** Next video URL, emitted 3 s before the swap to begin buffering. */
  public readonly nextVideoSrc: Signal<string | undefined> = toSignal(
    this.videoRotation$.pipe(
      map(() => getRandomVideoSrc(this.currentRawSrc)),
      delay(3000),
    ),
    { initialValue: undefined },
  );
}
