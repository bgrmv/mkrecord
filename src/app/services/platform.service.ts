import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, Signal } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PlatformService {
  readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly isMobile: Signal<boolean> = toSignal(
    inject(BreakpointObserver)
      .observe([Breakpoints.XSmall, Breakpoints.Small])
      .pipe(map((state) => state.matches)),
    { initialValue: false },
  );
}
