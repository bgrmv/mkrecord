import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { MouseHeatService } from '@services/mouse-heat.service';
import { PlatformService } from '@services/platform.service';

@Component({
  selector: 'app-cursor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  styles: [
    `
      :host {
        position: fixed;
        top: 0;
        left: 0;
        pointer-events: none;
        z-index: 10000;
      }

      .cursor-container {
        /* use cursor-levitate for subtle floating effect */
        animation: cursor-levitate 3s ease-in-out infinite;
      }

      .cursor-dot {
        position: fixed;
        width: 6px;
        height: 6px;
        background-color: var(--c_red_l1);
        border-radius: 50%;
        /* center point is handled by transform binding in template */
        pointer-events: none;
        z-index: 10001;
      }

      /* use transition for smooth lag effect on bracket position */
      .cursor-bracket {
        position: fixed;
        width: 14px;
        height: 14px;
        border: 1px solid color-mix(
          in srgb,
          var(--c_red_l1) calc(var(--cursor-heat, 0%) * 0.4),
          var(--color_whitesmoke_darken_4)
        );
        transition: transform 85ms ease-out,
          border-color 60ms ease-out,
          filter 60ms ease-out;
        pointer-events: none;
        z-index: 10000;
        /* use filter for heat-reactive glow */
        filter: drop-shadow(
          0 0 calc(2px * var(--cursor-heat-val, 0))
          rgba(226, 74, 66, calc(var(--cursor-heat-val, 0) * 0.5))
        );
      }

      /* draw L-shaped brackets by removing opposite borders */
      .cursor-bracket.tl {
        border-right: none;
        border-bottom: none;
      }

      .cursor-bracket.tr {
        border-left: none;
        border-bottom: none;
      }

      .cursor-bracket.bl {
        border-right: none;
        border-top: none;
      }

      .cursor-bracket.br {
        border-left: none;
        border-top: none;
      }
    `,
  ],
  template: `
    @if (!platform.isMobile()) {
      <div
        class="cursor-container"
        [style.--cursor-heat]="cursorHeatPercent()"
        [style.--cursor-heat-val]="cursorHeatVal()">
        <span
          class="cursor-dot"
          [style.transform]="dotTransform()"></span>
        <span
          class="cursor-bracket tl"
          [style.transform]="bracketTlTransform()"></span>
        <span
          class="cursor-bracket tr"
          [style.transform]="bracketTrTransform()"></span>
        <span
          class="cursor-bracket bl"
          [style.transform]="bracketBlTransform()"></span>
        <span
          class="cursor-bracket br"
          [style.transform]="bracketBrTransform()"></span>
      </div>
    }
  `,
})
export class CursorComponent {
  readonly platform = inject(PlatformService);
  private readonly mouseHeat = inject(MouseHeatService);

  /* use computed to center the dot on the cursor position */
  readonly dotTransform = computed(() => {
    const x = this.mouseHeat.x();
    const y = this.mouseHeat.y();
    return `translate(calc(${x}px - 50%), calc(${y}px - 50%))`;
  });

  /* use computed to position each bracket in the corresponding direction
   * offset starts at 18px and tightens to 12px as heat increases (0 → 1) */
  readonly bracketTlTransform = computed(() => {
    const x = this.mouseHeat.x();
    const y = this.mouseHeat.y();
    const offset = 18 - this.mouseHeat.heat() * 6;
    return `translate(calc(${x}px - ${offset}px - 50%), calc(${y}px - ${offset}px - 50%))`;
  });

  readonly bracketTrTransform = computed(() => {
    const x = this.mouseHeat.x();
    const y = this.mouseHeat.y();
    const offset = 18 - this.mouseHeat.heat() * 6;
    return `translate(calc(${x}px + ${offset}px - 50%), calc(${y}px - ${offset}px - 50%))`;
  });

  readonly bracketBlTransform = computed(() => {
    const x = this.mouseHeat.x();
    const y = this.mouseHeat.y();
    const offset = 18 - this.mouseHeat.heat() * 6;
    return `translate(calc(${x}px - ${offset}px - 50%), calc(${y}px + ${offset}px - 50%))`;
  });

  readonly bracketBrTransform = computed(() => {
    const x = this.mouseHeat.x();
    const y = this.mouseHeat.y();
    const offset = 18 - this.mouseHeat.heat() * 6;
    return `translate(calc(${x}px + ${offset}px - 50%), calc(${y}px + ${offset}px - 50%))`;
  });

  /* use computed for percentage string (like CameraCornersLayerComponent) */
  readonly cursorHeatPercent = computed(() => {
    const h = this.mouseHeat.heat();
    return h > 0 ? `${Math.round(h * 100)}%` : '0%';
  });

  /* use computed for raw numeric value for animations */
  readonly cursorHeatVal = computed(() => {
    const h = this.mouseHeat.heat();
    return Math.round(h * 100) / 100;
  });
}
