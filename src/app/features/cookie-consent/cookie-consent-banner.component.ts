import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CookieConsentService } from '@services/cookie-consent.service';

@Component({
  selector: 'app-cookie-consent-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      :host {
        --_red: #e02020;
      }

      .scrim {
        position: fixed;
        inset: 0;
        z-index: 8999;
        background: rgba(0, 0, 0, 0.45);
        backdrop-filter: blur(2px);
      }

      .banner {
        position: fixed;
        left: 50%;
        bottom: 18px;
        transform: translateX(-50%);
        z-index: 9000;
        width: min(560px, calc(100vw - 32px));
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding: 20px 22px;
        background: rgba(10, 3, 3, 0.98);
        border: 1px solid rgba(224, 32, 32, 0.35);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.55);
      }

      /* HUD corner brackets — same pattern as splash-screen.component / contacts-me.component */
      .corner {
        position: absolute;
        width: 14px;
        height: 14px;
        border-color: var(--_red);
        border-style: solid;
        opacity: 0.55;

        &.tl {
          top: 8px;
          left: 8px;
          border-width: 2px 0 0 2px;
        }
        &.br {
          bottom: 8px;
          right: 8px;
          border-width: 0 2px 2px 0;
        }
      }

      .title {
        font-family: var(--font-display);
        font-size: clamp(12px, 2vw, 14px);
        font-weight: 700;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: var(--_red);
      }

      .copy {
        font-family: var(--font-body);
        font-size: 14px;
        line-height: 1.5;
        color: rgba(242, 242, 242, 0.75);
      }

      .actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
      }

      .action-btn {
        font-family: var(--font-display);
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        padding: 10px 18px;
        background: transparent;
        border: 1px solid rgba(242, 242, 242, 0.35);
        color: rgba(242, 242, 242, 0.85);
        cursor: pointer;
        transition:
          border-color 0.2s ease,
          color 0.2s ease;

        &:hover {
          border-color: var(--_red);
          color: var(--_red);
        }

        &.accept {
          border-color: var(--_red);
          color: var(--_red);

          &:hover {
            background: var(--_red);
            color: #050101;
          }
        }
      }
    `,
  ],
  template: `
    @if (status() === 'pending') {
      <div class="scrim" aria-hidden="true"></div>
      <div class="banner">
        <span class="corner tl" aria-hidden="true"></span>
        <span class="corner br" aria-hidden="true"></span>

        <span class="title">Cookies</span>
        <p class="copy">
          This site uses cookies and local storage to remember your
          preferences. Visit analytics is enabled and requires your consent
          before it runs.
        </p>

        <div class="actions">
          <button class="action-btn" type="button" (click)="decline()">
            Decline
          </button>
          <button class="action-btn accept" type="button" (click)="accept()">
            Accept
          </button>
        </div>
      </div>
    }
  `,
})
export class CookieConsentBannerComponent {
  private readonly cookieConsentService = inject(CookieConsentService);

  protected readonly status = this.cookieConsentService.status;

  protected accept(): void {
    this.cookieConsentService.accept();
  }

  protected decline(): void {
    this.cookieConsentService.decline();
  }
}
