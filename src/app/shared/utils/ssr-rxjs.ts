import { EMPTY, interval, Observable } from 'rxjs';
import { PlatformService } from '@services/platform.service';

/**
 * SSR-safe `interval()` — returns `EMPTY` on the server to prevent timer leaks.
 *
 * // use browserInterval because bare interval() creates an uncleanable timer on the server,
 * // leaking memory and blocking SSR response completion
 */
export function browserInterval(
  platform: PlatformService,
  period: number,
): Observable<number> {
  return platform.isBrowser ? interval(period) : EMPTY;
}
