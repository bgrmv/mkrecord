import { Component } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';

// see docs/todo — P1 #10: missing ChangeDetectionStrategy.OnPush; see docs/todo/tech-debt.md#change-detection
@Component({
  selector: 'app-nav-mobile',
  imports: [MatIconModule, RouterLink, RouterLinkActive, MatButtonToggleModule],
  styles: [
    `
      :host {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;

        display: flex;
        align-items: center;

        /* padding: 15px 0 !important; */

        z-index: 9999;

        width: 100%;
        /* border-top: 1px solid var(--color_whitesmoke_darken_4); */
        /* background-color: black; */
        /* height: max-content; */

        height: 60px; /* Задайте высоту панели */
        z-index: 1000;
        padding-bottom: env(
          safe-area-inset-bottom
        ); /* Для учета вырезов экранов */
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.5); /* Добавьте тень для визуального разделения */
      }

      nav {
        width: 100%;
        height: 100%;

        font-size: 50px;

        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 0;

        color: var(--color_whitesmoke);

        a {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;

          &.active {
            color: var(--color_black_9);
            background-color: var(--c_red);
          }
        }
      }

      .nav-mobile-icon {
        width: 25px;
        height: 25px;
        font-size: 25px;
      }
    `,
  ],
  template: `
    <nav>
      <a
        class="page-header"
        routerLink="/"
        routerLinkActive="active"
        [routerLinkActiveOptions]="{ exact: true }"
        ariaCurrentWhenActive="page">
        <mat-icon fontIcon="home_outlined" class="nav-mobile-icon"></mat-icon>
      </a>

      <a
        routerLink="/portfolio"
        routerLinkActive="active"
        ariaCurrentWhenActive="page">
        <mat-icon fontIcon="photo_library" class="nav-mobile-icon"></mat-icon>
      </a>

      <!-- see docs/todo/deprecated.md#corenav-mobile-componentts — spurious home attribute below, delete it -->
      <a
        routerLink="/info"
        home
        routerLinkActive="active"
        ariaCurrentWhenActive="page">
        <mat-icon fontIcon="info" class="nav-mobile-icon"></mat-icon>
      </a>

      <a
        routerLink="/contacts"
        routerLinkActive="active"
        ariaCurrentWhenActive="page">
        <mat-icon fontIcon="call" class="nav-mobile-icon"></mat-icon>
      </a>
    </nav>
  `,
})
export class NavMobileComponent {}
