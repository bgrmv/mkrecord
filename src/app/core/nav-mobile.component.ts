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
        0%,
        100% {
          text-shadow:
            0 0 8px rgba(224, 78, 66, 0.3),
            1px 1px 0 rgb(0, 0, 0);
        }
        50% {
          text-shadow:
            0 0 16px rgba(224, 78, 66, 0.5),
            0 0 24px rgba(224, 78, 66, 0.2),
            1px 1px 0 rgb(0, 0, 0);
        }
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

      /* --- Compact footer --- */
      .mobile-footer {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        padding: 6px 16px;
        background: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(12px);
        border-top: 1px solid rgba(224, 78, 66, 0.1);

        .social-link {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          color: var(--color_whitesmoke_darken_3);
          transition: color 200ms ease;

          &:hover,
          &:active {
            color: var(--c_red_d1);
          }

          mat-icon {
            width: 16px;
            height: 16px;
            font-size: 16px;
          }
        }

        .copyright {
          font-size: 9px;
          color: var(--color_whitesmoke_darken_4);
          margin-left: 8px;
          white-space: nowrap;
          font-weight: 300;
        }
      }

      /* --- Bottom tab bar --- */
      nav {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        background: rgba(0, 0, 0, 0.92);
        backdrop-filter: blur(16px);
        border-top: 1px solid rgba(224, 78, 66, 0.15);
        padding-bottom: env(safe-area-inset-bottom);
      }

      .tab-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 3px;
        padding: 10px 0;
        position: relative;
        color: var(--color_whitesmoke_darken_3);
        transition:
          color 200ms ease,
          background 200ms ease;

        /* Top accent line */
        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 2px;
          background: var(--c_red);
          border-radius: 0 0 2px 2px;
          transition: width 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .tab-icon {
          font-size: 22px;
          width: 22px;
          height: 22px;
          color: inherit;
          transition: transform 200ms ease;
        }

        .tab-label {
          font-family: 'Orbitron', 'Roboto', sans-serif;
          font-size: 8px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: inherit;
        }

        &:active {
          background: rgba(224, 78, 66, 0.06);

          .tab-icon {
            transform: scale(0.9);
          }
        }

        &.active {
          color: var(--c_red);
          animation: focus-glow 1.5s ease-in-out infinite;

          &::before {
            width: 60%;
            box-shadow: 0 0 8px rgba(224, 78, 66, 0.4);
          }

          .tab-icon {
            filter: drop-shadow(0 0 4px rgba(224, 78, 66, 0.3));
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
