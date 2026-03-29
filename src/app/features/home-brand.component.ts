import { ChangeDetectionStrategy, Component } from '@angular/core';
// use ParallaxItemDirective because it provides depth effect for brand logo via mouse tracking with requestAnimationFrame optimization
import { ParallaxItemDirective } from '@shared/directives/parrallax-item.directive';

@Component({
  selector: 'app-home-brand',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  // use hostDirectives because it applies directive to component's host element in angular way; better than direct DOM manipulation
  hostDirectives: [ParallaxItemDirective],
  styles: [
    `
      :host {
        position: relative;
        width: calc(45% - 150px);
        min-width: 230px;
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
        width: calc(100vh - 60%);

        // use CSS custom property for glitch effect from parallax directive; applies micro-offset to brand images
        transform: translate(var(--glitch-offset-x, 0), var(--glitch-offset-y, 0));
        transition: transform 0.05s linear;

        img {
          // use will-change to prepare GPU for glitch animations
          will-change: transform;
        }

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
export class HomeBrandComponent {}
