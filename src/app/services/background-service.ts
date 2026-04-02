import { computed, inject, Injectable, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { CategoryEnum, portfolios } from '@app/constants';
import { browserInterval } from '@shared/utils/ssr-rxjs';
import { delay, filter, map, share, startWith } from 'rxjs';
import { PlatformService } from './platform.service';

const backgroundVideos = portfolios[CategoryEnum.Horizontal].filter(
  (video) => video.asBackground,
);

const PAGES_WITHOUT_BG = ['portfolio', 'contacts'];

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
      // use Array.some() because the list of disabled pages can grow without changing the predicate
      map((url) => !PAGES_WITHOUT_BG.some((page) => url.includes(page))),
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

  private readonly _rawVideoSrc: Signal<string | undefined> = toSignal(
    this.videoRotation$,
    { initialValue: undefined },
  );

  private readonly _rawNextVideoSrc: Signal<string | undefined> = toSignal(
    this.videoRotation$.pipe(
      map(() => getRandomVideoSrc(this.currentRawSrc)),
      delay(3000),
    ),
    { initialValue: undefined },
  );

  // use computed() because startWith() sets a src unconditionally — gating here ensures
  // videoSrc emits undefined when navigating to a page without background video,
  // so the @if in the template removes the <video> element and stops playback
  public readonly videoSrc: Signal<string | undefined> = computed(() =>
    this.hasBackgroundVideos() ? this._rawVideoSrc() : undefined,
  );

  /** Next video URL, emitted 3 s before the swap to begin buffering. */
  public readonly nextVideoSrc: Signal<string | undefined> = computed(() =>
    this.hasBackgroundVideos() ? this._rawNextVideoSrc() : undefined,
  );
}
