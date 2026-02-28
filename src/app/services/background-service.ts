import {
  DestroyRef,
  inject,
  Injectable,
  PLATFORM_ID,
  Signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, interval, map, startWith } from 'rxjs';
import { CategoryEnum, portfolios } from '../constants';

const backgroundVideos = portfolios[CategoryEnum.Horizontal].filter(
  video => video.asBackground
);

const getRandomVideoSrc = (localVideoSrc?: string): string => {
  while (true) {
    const randomIdx = Math.floor(Math.random() * backgroundVideos.length);

    if (backgroundVideos[randomIdx].preview === localVideoSrc) {
      continue;
    }

    return backgroundVideos[randomIdx].preview;
    // Add video if not in last 3
    // if (!last3Idx.includes(randomIdx)) {
    //   last3Idx.push(randomIdx);
    //   src = horizonalVideos[randomIdx]?.preview;
    //   if (last3Idx.length > 4) {
    //     last3Idx.shift();
    //   }
    //   break;
    // }
  }

  // return src;
};

@Injectable({
  providedIn: 'root',
})
export class BackgroundService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  public readonly isActive: Signal<boolean> = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(url => (url instanceof NavigationEnd ? url.url : '')),
      map(url => !url.includes('portfolio'))
    ),
    { initialValue: false }
  );

  public readonly videoSrc: Signal<string | undefined> = toSignal(
    interval(5000).pipe(
      filter(() => this.isActive()),
      map(() => getRandomVideoSrc(this.videoSrc())),
      startWith(getRandomVideoSrc())
    ),
    { initialValue: undefined }
  );
}
