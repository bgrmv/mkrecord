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
      @keyframes corner-pulse {
        0%, 100% { opacity: 0.4; }
        50% { opacity: 1; }
      }

      @keyframes grain-drift {
        0%, 100% { transform: translate(0, 0); }
        33% { transform: translate(-1px, 1px); }
        66% { transform: translate(1px, -1px); }
      }

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
          /* use min() for a clean responsive width that leaves 20px breathing room each side */
          width: min(calc(100% - 40px), 380px);
          min-width: 0;
          padding: 48px 32px;
          border-color: rgba(224, 78, 66, 0.3);
          background: linear-gradient(
            145deg,
            rgba(10, 5, 5, 0.88) 0%,
            rgba(25, 10, 10, 0.65) 100%
          );
        }

        /* Camera viewfinder: top-left corner */
        :host::before {
          content: '';
          position: absolute;
          top: 10px;
          left: 10px;
          width: 18px;
          height: 18px;
          border-top: 1.5px solid var(--c_red);
          border-left: 1.5px solid var(--c_red);
          animation: corner-pulse 2.5s ease-in-out infinite;
          pointer-events: none;
        }

        /* Camera viewfinder: bottom-right corner */
        :host::after {
          content: '';
          position: absolute;
          bottom: 10px;
          right: 10px;
          width: 18px;
          height: 18px;
          border-bottom: 1.5px solid var(--c_red);
          border-right: 1.5px solid var(--c_red);
          animation: corner-pulse 2.5s ease-in-out infinite 1.25s;
          pointer-events: none;
        }

        .brand {
          width: 100%;
          /* disable parallax on mobile — no mouse cursor, parallax directive is a no-op */
          transform: none !important;
          transition: none !important;

          img.mk {
            width: 100%;
            max-width: 300px;
            display: block;
            margin: 0 auto;
            /* film grain overlay on logo */
            filter: drop-shadow(0 0 12px rgba(224, 78, 66, 0.15));
          }
        }
      }
    `,
  ],
  template: `
    <div class="brand">
      
      <img class="mk" src="assets/brand/mk-white.svg" />
    </div>
    <!-- <img class="mk" src="assets/brand/mk.svg" />
    <img class="studio" src="assets/brand/studio.svg" /> -->
  `,
})
export class HomeBrandComponent {}
