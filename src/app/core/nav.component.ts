import { Component } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';

// see docs/todo — P1 #10: missing ChangeDetectionStrategy.OnPush; see docs/todo/tech-debt.md#change-detection
@Component({
  selector: 'app-nav',
  imports: [MatIconModule, RouterLink, RouterLinkActive, MatButtonToggleModule],
  styles: [
    `
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
        font-size: calc(10px + 2vmin);
        color: var(--color_whitesmoke);

        > ul {
          display: inline-flex;
          flex-wrap: wrap;
          gap: 30px;
          align-items: center;

          li {
            color: var(--color_whitesmoke_darken_2);

            a {
              font-weight: 700;
              text-shadow: 1px 1px 0 rgb(0, 0, 0);
              text-align: center;

              &.active {
                color: var(--c_red);

                filter: none;
                border-bottom: 1px solid var(--c_red);
              }
            }
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
            ariaCurrentWhenActive="page">
            Home
          </a>
        </li>
        <li>
          <a
            routerLink="/portfolio"
            routerLinkActive="active"
            ariaCurrentWhenActive="page">
            Portfolio
          </a>
        </li>

        <li>
          <!-- see docs/todo/deprecated.md#corenav-componentts — spurious home attribute below, delete it -->
          <a
            routerLink="/info"
            home
            routerLinkActive="active"
            ariaCurrentWhenActive="page">
            About me
          </a>
        </li>
        <li>
          <a
            routerLink="/contacts"
            routerLinkActive="active"
            ariaCurrentWhenActive="page">
            Contact me
          </a>
        </li>
      </ul>
    </nav>
  `,
})
export class NavComponent {}
