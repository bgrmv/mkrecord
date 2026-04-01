import {
  animate,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { CategoryEnum, portfolios } from '@app/constants';
import { PortfolioBlockHorizontalComponent } from '@entities/portfolio-block/portfolio-block-horizontal.component';
import { PortfolioBlockVerticalComponent } from '@entities/portfolio-block/portfolio-block-vertical.component';
import { PlatformService } from '@services/platform.service';

const fadeIn = trigger('fadeIn', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(10px)' }),
    animate(
      '600ms cubic-bezier(0.16, 0.84, 0.3, 1)',
      style({ opacity: 1, transform: 'translateY(0)' }),
    ),
  ]),
]);

@Component({
  selector: 'app-portfolio-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, PortfolioBlockHorizontalComponent, PortfolioBlockVerticalComponent, MatTabsModule, MatIconModule],
  animations: [fadeIn],
  styles: [
    `
      /* ── Tab overrides ── */
      /* use ::ng-deep because Material tab wrappers are outside component scope */
      ::ng-deep {
        .mat-mdc-tab-group {
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
        }

        .mdc-tab--active .mdc-tab__text-label {
          color: var(--c_red_l1) !important;
          text-shadow:
            0 0 8px rgba(242, 93, 80, 0.9),
            0 0 24px rgba(242, 93, 80, 0.5),
            0 0 48px rgba(242, 93, 80, 0.2);
        }

        .mdc-tab--active .mat-icon {
          color: var(--c_red_l1);
          filter: drop-shadow(0 0 6px rgba(242, 93, 80, 0.8));
        }

        /* use Orbitron because it matches the camera/tech aesthetic of the site */
        .mdc-tab__text-label {
          font-family: 'Orbitron', sans-serif;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          font-weight: 900;
          font-size: clamp(10px, 1.3vw, 13px);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .mdc-tab:not(.mdc-tab--active) .mdc-tab__text-label {
          color: rgba(245, 245, 245, 0.65);
          transition: color 0.3s ease;
        }

        .mdc-tab:not(.mdc-tab--active):hover .mdc-tab__text-label {
          color: rgba(245, 245, 245, 0.9);
        }

        .mdc-tab:not(.mdc-tab--active) .mat-icon {
          color: rgba(245, 245, 245, 0.5);
        }

        .mat-mdc-tab-header {
          border-bottom: 1px solid rgba(224, 78, 66, 0.3);
          background: linear-gradient(
            180deg,
            rgba(13, 13, 13, 0.6) 0%,
            rgba(20, 10, 10, 0.4) 100%
          );
        }

        /* active indicator line glow */
        .mdc-tab-indicator__content--underline {
          box-shadow: 0 0 6px var(--c_red), 0 0 18px rgba(224, 78, 66, 0.5);
        }

        .mat-mdc-tab-body-wrapper {
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
        }

        .mat-mdc-tab-body {
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
        }

        .mat-mdc-tab-body-content {
          flex: 1;
          min-height: 0;
          overflow: hidden !important;
          display: flex;
          flex-direction: column;
        }
      }

      :host {
        z-index: 9999;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        padding: clamp(8px, 1.5vw, 16px);
        box-sizing: border-box;
      }

      .portfolio-container {
        position: relative;
        width: 100%;
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        border: 1px solid rgba(224, 78, 66, 0.15);
        background: linear-gradient(
          145deg,
          rgba(13, 13, 13, 0.4),
          rgba(30, 18, 16, 0.2)
        );
      }

      /* ── Corner marks ── */

      .corner-mark {
        position: absolute;
        width: 16px;
        height: 16px;
        z-index: 10;
        pointer-events: none;
      }

      .corner-mark::before,
      .corner-mark::after {
        content: '';
        position: absolute;
        background: var(--c_red_d1);
      }

      .corner-tl {
        top: 4px;
        left: 4px;
      }
      .corner-tl::before {
        width: 16px;
        height: 1px;
        top: 0;
        left: 0;
      }
      .corner-tl::after {
        width: 1px;
        height: 16px;
        top: 0;
        left: 0;
      }

      .corner-tr {
        top: 4px;
        right: 4px;
      }
      .corner-tr::before {
        width: 16px;
        height: 1px;
        top: 0;
        right: 0;
      }
      .corner-tr::after {
        width: 1px;
        height: 16px;
        top: 0;
        right: 0;
      }

      .corner-bl {
        bottom: 4px;
        left: 4px;
      }
      .corner-bl::before {
        width: 16px;
        height: 1px;
        bottom: 0;
        left: 0;
      }
      .corner-bl::after {
        width: 1px;
        height: 16px;
        bottom: 0;
        left: 0;
      }

      .corner-br {
        bottom: 4px;
        right: 4px;
      }
      .corner-br::before {
        width: 16px;
        height: 1px;
        bottom: 0;
        right: 0;
      }
      .corner-br::after {
        width: 1px;
        height: 16px;
        bottom: 0;
        right: 0;
      }

      @media (max-width: 576px) {
        :host {
          padding: clamp(4px, 2vw, 10px);
        }
      }
    `,
  ],
  template: `
    <div class="portfolio-container" [@fadeIn]>
      <span class="corner-mark corner-tl"></span>
      <span class="corner-mark corner-tr"></span>
      <span class="corner-mark corner-bl"></span>
      <span class="corner-mark corner-br"></span>

      <mat-tab-group animationDuration="600ms">
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>crop_landscape</mat-icon>
            Landscape
          </ng-template>
          <app-portfolio-block-horizontal
            [gridView]="'1'"
            [slotMode]="isDesktop()"
            [portfolios]="portfolios[categoryEnum.Horizontal]" />
        </mat-tab>

        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>crop_portrait</mat-icon>
            Portrait
          </ng-template>
          <app-portfolio-block-vertical
            [gridView]="'1'"
            [slotMode]="isDesktop()"
            [portfolios]="portfolios[categoryEnum.Vertical]" />
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  providers: [],
})
export class PortfolioPageComponent {
  private readonly platformService = inject(PlatformService);

  public readonly isDesktop = computed(() => !this.platformService.isMobile());

  public readonly categoryEnum = CategoryEnum;

  protected readonly portfolios = portfolios;
}
