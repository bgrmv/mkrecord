import { afterNextRender, computed, inject, Injectable, signal } from '@angular/core';
import { PlatformService } from '@services/platform.service';

// use a namespaced key — same convention as SPLASH_SEEN_KEY in app.component.ts
const COOKIE_CONSENT_KEY = 'mkrecord:cookie-consent';

type ConsentStatus = 'pending' | 'accepted' | 'declined';

@Injectable({ providedIn: 'root' })
export class CookieConsentService {
  private readonly platformService = inject(PlatformService);

  private readonly _status = signal<ConsentStatus>('pending');
  readonly status = this._status.asReadonly();

  // future analytics loaders (see docs/todo — L1) must check this before injecting any script
  readonly analyticsAllowed = computed(() => this._status() === 'accepted');

  constructor() {
    // browser-only localStorage read, guarded per PlatformService.isBrowser and run via
    // afterNextRender — same pattern as SPLASH_SEEN_KEY in app.component.ts
    afterNextRender(() => {
      if (!this.platformService.isBrowser) return;

      const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (stored === 'accepted' || stored === 'declined') {
        this._status.set(stored);
      }
    });
  }

  accept(): void {
    this._status.set('accepted');
    this.persist('accepted');
  }

  decline(): void {
    this._status.set('declined');
    this.persist('declined');
  }

  private persist(value: Exclude<ConsentStatus, 'pending'>): void {
    if (this.platformService.isBrowser) {
      localStorage.setItem(COOKIE_CONSENT_KEY, value);
    }
  }
}
