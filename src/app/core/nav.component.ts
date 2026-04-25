import { animate, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';

// Cinematic focus animation — line reveal + glow + scale
const cinematicFocus = trigger('cinematicFocus', [
  transition(':enter', [
    style({ opacity: 0, transform: 'scale(0.95) translateZ(0)' }),
    animate(
      '400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
      style({ opacity: 1, transform: 'scale(1) translateZ(0)' })
    ),
  ]),
]);

@Component({
  selector: 'app-nav',
  imports: [MatIconModule, RouterLink, RouterLinkActive, MatButtonToggleModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [cinematicFocus],
  styles: [
    `
      @keyframes line-reveal {
        from {
          width: 0;
          opacity: 0;
        }
        to {
          width: 100%;
          opacity: 1;
        }
      }

      @keyframes focus-glow {
        0%, 100% {
          text-shadow: 0 0 10px rgba(224, 78, 66, 0.4),
                       1px 1px 0 rgb(0, 0, 0);
          filter: brightness(1);
        }
        50% {
          text-shadow: 0 0 20px rgba(224, 78, 66, 0.6),
                       0 0 30px rgba(224, 78, 66, 0.3),
                       1px 1px 0 rgb(0, 0, 0);
          filter: brightness(1.1);
        }
      }

      @keyframes pulse-subtle {
        0%, 100% {
          letter-spacing: 0.05em;
        }
        50% {
          letter-spacing: 0.08em;
        }
      }

      :host {
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        top: 0;
        padding: 35px 0 !important;
        z-index: 9999;
      }

      nav {
        position: relative;
        top: 0;
        text-align: center;
        align-items: center;
        justify-content: center;
        font-size: calc(9px + 1.5vmin);
        color: var(--color_whitesmoke);

        > ul {
          display: inline-flex;
          flex-wrap: wrap;
          gap: clamp(20px, 3vw, 40px);
          align-items: center;
          justify-content: center;

          li {
            position: relative;
            color: var(--color_whitesmoke_darken_2);
            list-style: none;

            &:not(:last-child)::after {
              content: '';
              position: absolute;
              right: calc(-1 * (clamp(10px, 1.5vw, 20px) + 6px));
              top: 50%;
              transform: translateY(-50%);
              width: 2px;
              height: 18px;
              background: linear-gradient(
                to bottom,
                rgba(224, 78, 66, 0),
                rgba(224, 78, 66, 0.5),
                rgba(224, 78, 66, 0)
              );
              opacity: 0.3;
            }

            a {
              position: relative;
              display: block;
              font-family: 'Orbitron', 'Roboto', sans-serif;
              font-weight: 700;
              letter-spacing: 0.05em;
              text-transform: uppercase;
              font-size: 0.95em;
              padding: 8px 12px;
              transition: color 200ms ease, letter-spacing 300ms ease;
              will-change: color, letter-spacing, text-shadow;

              &::before {
                content: '';
                position: absolute;
                bottom: -6px;
                left: 50%;
                width: 0;
                height: 2px;
                background: var(--c_red);
                transform: translateX(-50%);
                transition: width 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
              }

              &:hover {
                letter-spacing: 0.08em;
                color: rgba(224, 78, 66, 0.8);
              }

              &.active {
                color: var(--c_red);
                animation: focus-glow 1.5s ease-in-out infinite;

                &::before {
                  width: 100%;
                  background: linear-gradient(
                    to right,
                    var(--c_red) 0%,
                    var(--c_red_l1) 50%,
                    var(--c_red) 100%
                  );
                  box-shadow: 0 0 10px rgba(224, 78, 66, 0.6),
                              0 0 20px rgba(224, 78, 66, 0.3);
                  animation: line-reveal 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
                }
              }
            }
          }
        }
      }

      @media (max-width: 768px) {
        nav > ul {
          gap: clamp(15px, 2vw, 25px);

          li:not(:last-child)::after {
            right: calc(-1 * (clamp(7px, 1vw, 15px) + 4px));
            height: 14px;
          }
        }
      }
    `,
  ],
  template: `
    <nav>
      <ul>
        <li>
          <a
            class="page-header"
            routerLink="/"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }"
            [@cinematicFocus]="true"
            ariaCurrentWhenActive="page">
            Home
          </a>
        </li>
        <li>
          <a
            routerLink="/portfolio"
            routerLinkActive="active"
            [@cinematicFocus]="true"
            ariaCurrentWhenActive="page">
            Portfolio
          </a>
        </li>

        <li>
          <a
            routerLink="/info"
            routerLinkActive="active"
            [@cinematicFocus]="true"
            ariaCurrentWhenActive="page">
            About me
          </a>
        </li>
        <li>
          <a
            routerLink="/contacts"
            routerLinkActive="active"
            [@cinematicFocus]="true"
            ariaCurrentWhenActive="page">
            Contact me
          </a>
        </li>
      </ul>
    </nav>
  `,
})
export class NavComponent {}
