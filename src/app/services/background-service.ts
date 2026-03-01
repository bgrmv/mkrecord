import { inject, Injectable, PLATFORM_ID, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { filter, interval, map, startWith } from 'rxjs';
import { CategoryEnum, portfolios } from '../constants';

const backgroundVideos = portfolios[CategoryEnum.Horizontal].filter(
  video => video.asBackground
);

const getRandomVideoSrc = (localVideoSrc?: SafeResourceUrl): string => {
  while (true) {
    const randomIdx = Math.floor(Math.random() * backgroundVideos.length);

    if (backgroundVideos[randomIdx].preview === localVideoSrc) {
      continue;
    }

    console.log(
      'Selected background video:',
      backgroundVideos[randomIdx].preview
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
      filter(event => event instanceof NavigationEnd),
      map(url => (url instanceof NavigationEnd ? url.url : '')),
      map(url => !url.includes('portfolio'))
      // map(() => false)
    ),
    { initialValue: false }
  );

  public readonly videoSrc: Signal<SafeResourceUrl | undefined> = toSignal(
    interval(5000).pipe(
      filter(() => this.hasBackgroundVideos()),
      map(() => getRandomVideoSrc(this.videoSrc())),
      map(src => this.sanitizer.bypassSecurityTrustResourceUrl(src)),
      startWith(getRandomVideoSrc())
    ),
    { initialValue: undefined }
  );
}
