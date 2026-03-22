import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
// see docs/todo/deprecated.md#featureshome-brand-componentts — unused imports below; also FSD violation (feature importing sibling feature); see docs/todo/tech-debt.md#fsd-layer-violations
import { ParallaxItemDirective } from '../shared/directives/parrallax-item.directive';
import { PortfolioTimelineComponent } from './portfolio-timeline/portfolio-timeline.component';

@Component({
  selector: 'app-home-brand',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PortfolioTimelineComponent, ParallaxItemDirective],
  styles: [
    `
      :host {
        position: relative;
        width: calc(45% - 150px);
        min-width: 230px;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        display: flex;

        justify-content: center;
        align-items: center;

        padding: 50px;
        border: 1px solid var(--color_whitesmoke_darken_5);
        background-color: rgba(0, 0, 0, 0.2);
      }

      .brand {
        display: flex;
        gap: 10px;
        flex-direction: column;
        width: calc(100vw - 60%);

        img.studio {
          padding: 10px 0;
          border-top: 4px solid whitesmoke;
        }
      }

      @media (max-width: 576px) {
        :host {
          width: calc(125% - 200px);
        }
      }
    `,
  ],
  template: `
    <div class="brand">
      <img class="mk" src="assets/brand/mk.svg" />
      <img class="studio" src="assets/brand/studio.svg" />
    </div>
  `,
})
export class HomeBrandComponent {
  readonly timelineImageSignal = signal<string | null>(null); // see docs/todo/deprecated.md#featureshome-brand-componentts — never used, delete
}
