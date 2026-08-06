import { inject, Injectable, signal } from '@angular/core';
import { PlatformService } from '@services/platform.service';

// use a namespaced key — same convention as COOKIE_CONSENT_KEY / SPLASH_SEEN_KEY
const SCROLL_HINT_KEY_PREFIX = 'mkrecord:scroll-learned:';

// horizontal and vertical lanes are learned independently — scrolling a row
// teaches nothing about the vertical columns and vice versa
export type ScrollAxis = 'x' | 'y';

/**
 * Remembers whether the user has already discovered that lanes scroll.
 * One scroll on any lane of an axis hides the hint on every lane of that axis,
 * and the fact is persisted per device so the hint never returns.
 */
@Injectable({ providedIn: 'root' })
export class ScrollHintService {
  private readonly platformService = inject(PlatformService);

  private readonly state = {
    x: signal(this.read('x')),
    y: signal(this.read('y')),
  };

  // queries — components bind to these, never mutate them
  readonly learnedX = this.state.x.asReadonly();
  readonly learnedY = this.state.y.asReadonly();

  // command — called once the user scrolls a lane by hand
  markLearned(axis: ScrollAxis): void {
    if (this.state[axis]()) return;

    this.state[axis].set(true);
    this.write(axis);
  }

  // use a synchronous read (not afterNextRender) because the hint is only rendered
  // after the client-side lane measurement runs — there is no SSR markup to mismatch
  private read(axis: ScrollAxis): boolean {
    if (!this.platformService.isBrowser) return false;

    try {
      return localStorage.getItem(SCROLL_HINT_KEY_PREFIX + axis) === '1';
    } catch {
      // localStorage can throw in private mode / blocked-cookies contexts
      return false;
    }
  }

  private write(axis: ScrollAxis): void {
    if (!this.platformService.isBrowser) return;

    try {
      localStorage.setItem(SCROLL_HINT_KEY_PREFIX + axis, '1');
    } catch {
      // persistence is best-effort; the in-memory signal still hides the hint
    }
  }
}
