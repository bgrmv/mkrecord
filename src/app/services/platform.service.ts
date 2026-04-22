import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import {
  inject,
  Injectable,
  PLATFORM_ID,
  REQUEST,
  Signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PlatformService {
  private readonly request = inject(REQUEST, { optional: true });
  public readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  public readonly isServer = isPlatformServer(inject(PLATFORM_ID));

  public readonly isMobile: Signal<boolean> = toSignal(
    inject(BreakpointObserver)
      .observe([Breakpoints.XSmall, Breakpoints.Small])
      .pipe(map((state) => state.matches)),
    { initialValue: this.getInitialMobileValue() },
  );

  // use user-agent detection on server to provide correct initialValue for SSR hydration
  // on client, BreakpointObserver will take over immediately and provide accurate value
  private getInitialMobileValue(): boolean {
    if (this.isBrowser) {
      return false; // client will get correct value from BreakpointObserver almost immediately
    }

    // on server, detect mobile from user-agent header
    if (this.isServer) {
      try {
        const userAgent = this.request?.headers?.get('user-agent') ?? '';
        return this.isMobileUserAgent(userAgent);
      } catch {
        return false;
      }
    }

    return false;
  }

  // detect mobile devices from user-agent string
  private isMobileUserAgent(userAgent: string): boolean {
    const mobilePatterns = [
      /mobile/i,
      /android/i,
      /iphone/i,
      /ipad/i,
      /ipod/i,
      /blackberry/i,
      /windows phone/i,
      /opera mini/i,
    ];

    return mobilePatterns.some((pattern) => pattern.test(userAgent));
  }
}
