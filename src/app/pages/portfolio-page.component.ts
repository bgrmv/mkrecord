import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { DeviceDetectorService } from 'ngx-device-detector';
import { CategoryEnum, portfolios } from '../constants';
import { PortfolioBlockComponent } from '../features/portfolio-block/portfolio-block.component';

export type PortfolioResolution =
  | '480x270'
  | '640x360'
  | '800x450'
  | '960x540'
  | '1920x1080';

@Component({
  selector: 'app-portfolio-page',
  imports: [
    CommonModule,
    MatChipsModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    PortfolioBlockComponent,
    MatIconModule,
    MatDividerModule,
    MatTabsModule,
  ],
  styles: [
    `
      ::ng-deep {
        .mdc-tab--active {
          background-color: var(--c_red);
        }
      }

      :host {
        z-index: 9999;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        overflow: hidden;
        min-height: 960px;
      }

      .mat-mdc-standard-chip {
        border-radius: 0;

        button::before {
          border-radius: 0 !important;
        }
      }

      :host {
        mat-icon {
          color: var(--c_red);
        }

        mat-chip-listbox {
          max-width: 100%;
        }

        ::ng-deep
          .mat-mdc-standard-chip.mdc-evolution-chip--selected.mdc-evolution-chip--disabled {
          background-color: var(--c_red);
        }

        ::ng-deep .mat-mdc-chip-set-stacked .mdc-evolution-chip-set__chips {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
          gap: 4px 6px;
        }

        ::ng-deep
          .mat-mdc-chip-set-stacked
          .mdc-evolution-chip__text-label.mat-mdc-chip-action-label {
          color: var(--c_red);
        }

        ::ng-deep
          .mat-mdc-standard-chip.mdc-evolution-chip--selected:not(
            .mdc-evolution-chip--disabled
          ) {
          background-color: var(--c_red);
          color: black;
          border-color: var(--c_red);
        }

        ::ng-deep
          .mat-mdc-standard-chip
          .mdc-evolution-chip__action--primary::before {
          color: blue;
          border-radius: 0 !important;
          border-color: var(--c_red);
        }
      }
    `,
    `
      .mat-tab-group {
        margin-bottom: 48px;
      }

      .portofolio-container {
        overflow: hidden;
        min-height: 960px;
      }

      @media (max-width: 576px) {
        .portofolio-container {
          max-height: 486px;
        }
      }
    `,
  ],
  template: `
    <div class="portofolio-container">
      <mat-tab-group animationDuration="1000ms">
        <mat-tab [label]="categoryEnum.Horizontal | titlecase">
          <app-portfolio-block
            [gridView]="gridView()"
            [category]="categoryEnum.Horizontal"
            [portfolios]="portfolios[categoryEnum.Horizontal]" />
        </mat-tab>

        <mat-tab [label]="categoryEnum.Vertical | titlecase">
          <app-portfolio-block
            [gridView]="'1'"
            [category]="categoryEnum.Vertical"
            [portfolios]="portfolios[categoryEnum.Vertical]" />
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  providers: [DeviceDetectorService],
})
export class PortfolioPageComponent {
  private readonly deviceSerivce = inject(DeviceDetectorService);

  public readonly actualCategory = signal<CategoryEnum>(
    CategoryEnum.Horizontal
  );

  public readonly gridView = signal<string>(
    this.deviceSerivce.isMobile() ? '1' : '3'
  );

  public readonly categoryEnum = CategoryEnum;

  protected readonly portfolios = portfolios;
}
