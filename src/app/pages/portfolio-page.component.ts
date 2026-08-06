import { animate, style, transition, trigger } from '@angular/animations';
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
import { SeoService } from '@services/seo.service';

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
  imports: [
    CommonModule,
    PortfolioBlockHorizontalComponent,
    PortfolioBlockVerticalComponent,
    MatTabsModule,
    MatIconModule,
  ],
  animations: [fadeIn],
  styles: [
    `
      :host {
        font-family: var(--font-display);
      }

      :host ::ng-deep .mat-mdc-tab .mdc-tab__text-label {
        font-family: var(--font-display);
        font-weight: 700;
        text-transform: uppercase;
      }

      /* ── Tab overrides ── */
      /* use flat ":host ::ng-deep <selector>" rules instead of one nested
         "::ng-deep { ... }" block because inline styles here are plain CSS and
         Angular's style shim scopes the nested selectors with [_ngcontent-*];
         Material's tab wrappers are created outside this template, carry no
         such attribute, and never match — which is why the red label colors
         were silently dropped */
      :host ::ng-deep .mat-mdc-tab-group {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
        /* use --mat-tab-header-label-text-font token because Material resolves font-family
           through its own CSS custom property, bypassing direct font-family overrides */
        --mat-tab-header-label-text-font: var(--font-display);
        --mat-tab-header-active-label-text-color: var(--c_red_l1);
        --mat-tab-header-active-focus-label-text-color: var(--c_red_l1);
        --mat-tab-header-active-hover-label-text-color: var(--c_red_l1);
        --mat-tab-header-active-ripple-color: var(--c_red_l1);
        --mat-tab-header-inactive-ripple-color: var(--c_red_l1);
      }

      :host ::ng-deep .mdc-tab--active .mdc-tab__text-label {
        color: var(--c_red_l1) !important;
        text-shadow:
          0 0 8px rgba(242, 93, 80, 0.9),
          0 0 24px rgba(242, 93, 80, 0.5),
          0 0 48px rgba(242, 93, 80, 0.2);
      }

      :host ::ng-deep .mdc-tab--active .mat-icon {
        color: var(--c_red_l1);
        filter: drop-shadow(0 0 6px rgba(242, 93, 80, 0.8));
      }

      :host ::ng-deep .mat-mdc-tab .mdc-tab__text-label {
        font-family: var(--font-display);
        letter-spacing: 0.18em;
        text-transform: uppercase;
        font-weight: 900;
        font-size: clamp(10px, 1.3vw, 13px);
        display: flex;
        align-items: center;
        gap: 8px;
      }

      :host ::ng-deep .mdc-tab:not(.mdc-tab--active) .mdc-tab__text-label {
        color: rgba(245, 245, 245, 0.65);
        transition:
          color 0.3s ease,
          text-shadow 0.3s ease;
      }

      :host ::ng-deep .mdc-tab:not(.mdc-tab--active):hover .mdc-tab__text-label {
        color: var(--c_red_d1);
        text-shadow: 0 0 10px rgba(224, 78, 66, 0.45);
      }

      :host ::ng-deep .mdc-tab:not(.mdc-tab--active) .mat-icon {
        color: rgba(245, 245, 245, 0.5);
        transition:
          color 0.3s ease,
          filter 0.3s ease;
      }

      :host ::ng-deep .mdc-tab:not(.mdc-tab--active):hover .mat-icon {
        color: var(--c_red_d1);
        filter: drop-shadow(0 0 5px rgba(224, 78, 66, 0.5));
      }

      :host ::ng-deep .mat-mdc-tab-header {
        border-bottom: 1px solid rgba(224, 78, 66, 0.3);
        background: linear-gradient(
          180deg,
          rgba(13, 13, 13, 0.6) 0%,
          rgba(20, 10, 10, 0.4) 100%
        );
      }

      /* active indicator line glow */
      :host ::ng-deep .mdc-tab-indicator__content--underline {
        border-color: var(--c_red) !important;
        box-shadow:
          0 0 6px var(--c_red),
          0 0 18px rgba(224, 78, 66, 0.5);
      }

      :host ::ng-deep .mat-mdc-tab-body-wrapper {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
      }

      :host ::ng-deep .mat-mdc-tab-body {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
      }

      :host ::ng-deep .mat-mdc-tab-body-content {
        flex: 1;
        min-height: 0;
        overflow: hidden !important;
        display: flex !important;
        flex-direction: column;
      }

      :host {
        z-index: 9999;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-self: stretch;
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

      @media (max-width: 576px) {
        /* fill the exact height that main provides (100dvh - 5vh - nav)
           so the tab-header is in normal flow — no fixed positioning needed */
        :host {
          height: 100%;
          min-height: unset;
          overflow: hidden;
          box-sizing: border-box;
        }

        .portfolio-container {
          height: 100%;
          min-height: unset;
          overflow: hidden;
          flex: unset;
        }

        :host ::ng-deep .mat-mdc-tab-group {
          height: 100%;
          flex: 1;
          min-height: 0;
          overflow: hidden;
          padding-block: 4px;
          box-sizing: border-box;
        }

        /* tab-header sits at the bottom via headerPosition="below" */
        :host ::ng-deep .mat-mdc-tab-header {
          position: static;
          background: rgba(5, 5, 5, 0.95) !important;
          backdrop-filter: blur(14px);
          border-top: 1px solid rgba(224, 78, 66, 0.3);
          border-bottom: none;
        }

        /* shrink tab labels on mobile — desktop uses 1.3vw which is too wide at 390px */
        :host ::ng-deep .mat-mdc-tab .mdc-tab__text-label {
          font-size: clamp(8px, 2.8vw, 11px);
          letter-spacing: 0.12em;
          gap: 5px;
        }

        :host ::ng-deep .mat-mdc-tab-body-wrapper,
        :host ::ng-deep .mat-mdc-tab-body {
          flex: 1;
          min-height: 0;
          overflow: hidden;
        }

        /* use overflow-y: auto + scroll-snap-type so card-wrap snap-align works */
        :host ::ng-deep .mat-mdc-tab-body-content {
          overflow-y: auto !important;
          overflow-x: hidden !important;
          height: 100%;
          scroll-snap-type: y mandatory;
          scrollbar-color: var(--c_red) rgba(0, 0, 0, 0.3);
          scrollbar-width: thin;
        }
      }

      /* Very small phones: further compress tab labels */
      @media (max-width: 360px) {
        :host ::ng-deep .mat-mdc-tab .mdc-tab__text-label {
          font-size: clamp(7px, 2.4vw, 9px);
          letter-spacing: 0.08em;
          gap: 3px;
        }
      }
    `,
  ],
  template: `
    <div class="portfolio-container" [@fadeIn]>
      <mat-tab-group
        animationDuration="600ms"
        [headerPosition]="isDesktop() ? 'above' : 'below'">
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>crop_landscape</mat-icon>
            Landscape
          </ng-template>
          <!-- use matTabContent because lazy rendering ensures DOM has real
               dimensions when the component initializes auto-scroll -->
          <ng-template matTabContent>
            <app-portfolio-block-horizontal
              [gridView]="'1'"
              [slotMode]="isDesktop()"
              [portfolios]="portfolios[categoryEnum.Horizontal]" />
          </ng-template>
        </mat-tab>

        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>crop_portrait</mat-icon>
            Portrait
          </ng-template>
          <ng-template matTabContent>
            <app-portfolio-block-vertical
              [gridView]="'1'"
              [slotMode]="isDesktop()"
              [portfolios]="portfolios[categoryEnum.Vertical]" />
          </ng-template>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  providers: [],
})
export class PortfolioPageComponent {
  private readonly platformService = inject(PlatformService);

  constructor() {
    inject(SeoService).set({
      title: 'Portfolio',
      description:
        'Browse cinematic video work by Marek Kondratjev — brands, events, music videos, social media reels and short films.',
      keywords:
        'video portfolio, cinematic portfolio, commercial video portfolio, reels portfolio, event videos, brand video, short film',
      path: '/portfolio',
    });
  }

  public readonly isDesktop = computed(() => !this.platformService.isMobile());

  public readonly categoryEnum = CategoryEnum;

  protected readonly portfolios = portfolios;
}
