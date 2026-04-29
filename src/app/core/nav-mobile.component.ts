import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IconService } from '@services/icon.service';

@Component({
  selector: 'app-nav-mobile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, RouterLink, RouterLinkActive],
  providers: [IconService],
  styles: [
    `
      @keyframes focus-glow {
        0%, 100% {
          text-shadow:
            0 0 10px rgba(224, 78, 66, 0.5),
            1px 1px 0 rgb(0, 0, 0);
        }
        50% {
          text-shadow:
            0 0 22px rgba(224, 78, 66, 0.8),
            0 0 40px rgba(224, 78, 66, 0.3),
            1px 1px 0 rgb(0, 0, 0);
        }
      }

      @keyframes icon-pulse {
        // use text-shadow because mat-icon fontIcon renders as font glyph — text-shadow follows glyph outline, filter: drop-shadow wraps the rectangular element box
        0%, 100% { text-shadow: 0 0 4px rgba(224, 78, 66, 0.4); }
        50%       { text-shadow: 0 0 10px rgba(224, 78, 66, 0.75); }
      }

      :host {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 1000;
        display: flex;
        flex-direction: column;
      }

      /* --- Bottom tab bar --- */
      nav {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        background: linear-gradient(
          180deg,
          rgba(8, 3, 3, 0.96) 0%,
          rgba(13, 5, 5, 0.98) 100%
        );
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border-top: 1px solid rgba(224, 78, 66, 0.2);
        padding-bottom: env(safe-area-inset-bottom);
        /* Subtle depth shadow above the nav */
        box-shadow:
          0 -1px 0 rgba(224, 78, 66, 0.08),
          0 -8px 32px rgba(0, 0, 0, 0.85);
      }

      .tab-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        padding: 12px 0 10px;
        position: relative;
        /* use slightly brighter inactive color for legibility on dark background */
        color: rgba(242, 242, 242, 0.4);
        transition:
          color 250ms cubic-bezier(0.4, 0, 0.2, 1),
          background 250ms ease;
        -webkit-tap-highlight-color: transparent;
        user-select: none;

        /* Top accent bar */
        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 2px;
          background: var(--c_red);
          border-radius: 0 0 3px 3px;
          transition: width 350ms cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        /* Active: radial glow bloom beneath the indicator bar */
        &::after {
          content: '';
          position: absolute;
          top: 2px;
          left: 50%;
          transform: translateX(-50%);
          width: 48px;
          height: 6px;
          background: radial-gradient(
            ellipse at center,
            rgba(224, 78, 66, 0.45) 0%,
            transparent 70%
          );
          opacity: 0;
          transition: opacity 300ms ease;
          pointer-events: none;
        }

        .tab-icon {
          font-size: 22px;
          width: 22px;
          height: 22px;
          color: inherit;
          transition: transform 220ms cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .tab-label {
          font-family: var(--font-display);
          font-size: 7px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: inherit;
          transition: color 250ms ease;
        }

        &:active {
          background: rgba(224, 78, 66, 0.07);

          .tab-icon {
            transform: scale(0.88) translateY(1px);
          }
        }

        &.active {
          color: var(--c_red);
          animation: focus-glow 2s ease-in-out infinite;

          &::before {
            /* use 68% width so the active bar spans most of the tab without touching edges */
            width: 68%;
            // use negative y-offset so glow bleeds upward above the bar, not downward onto the icon
            box-shadow:
              0 -4px 10px rgba(224, 78, 66, 0.6),
              0 -2px 20px rgba(224, 78, 66, 0.25);
          }

          &::after {
            opacity: 1;
          }

          .tab-icon {
            animation: icon-pulse 2s ease-in-out infinite;
          }
        }
      }
    `,
  ],
  template: `
    <!-- Bottom tab bar -->
    <nav>
      <a
        class="tab-btn"
        routerLink="/"
        routerLinkActive="active"
        [routerLinkActiveOptions]="{ exact: true }"
        ariaCurrentWhenActive="page">
        <mat-icon fontIcon="home" class="tab-icon" />
        <span class="tab-label">Home</span>
      </a>

      <a
        class="tab-btn"
        routerLink="/portfolio"
        routerLinkActive="active"
        ariaCurrentWhenActive="page">
        <mat-icon fontIcon="photo_library" class="tab-icon" />
        <span class="tab-label">Work</span>
      </a>

      <a
        class="tab-btn"
        routerLink="/info"
        routerLinkActive="active"
        ariaCurrentWhenActive="page">
        <mat-icon fontIcon="info" class="tab-icon" />
        <span class="tab-label">About</span>
      </a>

      <a
        class="tab-btn"
        routerLink="/contacts"
        routerLinkActive="active"
        ariaCurrentWhenActive="page">
        <mat-icon fontIcon="call" class="tab-icon" />
        <span class="tab-label">Contact</span>
      </a>
    </nav>
  `,
})
export class NavMobileComponent {
  protected readonly year = new Date().getFullYear();
}
