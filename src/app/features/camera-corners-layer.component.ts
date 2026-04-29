import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { CameraBatteryComponent } from './camera-battery/camera-battery.component';
import { CameraQualityResolutionComponent } from './camera-quality-resolution.component';
import { CameraRecComponent } from './camera-rec.component';
import { CameraTimerComponent } from './camera-timer/camera-timer.component';
import { MouseHeatService } from '@services/mouse-heat.service';

@Component({
  selector: 'app-camera-corners-layer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CameraTimerComponent,
    CameraBatteryComponent,
    CameraQualityResolutionComponent,
    CameraRecComponent,
  ],
  styles: [
    `
      :host {
        position: absolute;
        padding: 25px;
        font-family: var(--font-display);
        width: 100%;
        height: 100%;
        pointer-events: none;
        top: 0;
        left: 0;
        z-index: 9999;
        filter: brightness(var(--corner-brightness, 1));
        opacity: var(--corner-opacity, 0.6);
        transition: opacity 0.3s ease-out, filter 0.3s ease-out;
      }

      .corners-container {
        position: relative;
        height: 100%;

        & > .camera-corner {
          position: absolute;
          /* use calc to increase width by 10% based on heat; height grows proportionally via aspect-ratio */
          width: calc(110px * (1 + var(--corner-heat-val, 0) * 0.1));
          aspect-ratio: 16 / 9;
          padding: 20px;
          display: flex;
          /* use transition for smooth color, glow, and width animations */
          transition: border-color 0.05s ease-out, filter 0.05s ease-out,
            width 0.05s ease-out;
        }

        #top-left {
          top: 0;
          left: 0;
          border-top: 1px solid color-mix(
            in srgb,
            var(--c_red_l1) calc(var(--corner-heat, 0%) * 0.5),
            var(--color_whitesmoke_darken_4)
          );
          border-left: 1px solid color-mix(
            in srgb,
            var(--c_red_l1) calc(var(--corner-heat, 0%) * 0.5),
            var(--color_whitesmoke_darken_4)
          );
          /* use drop-shadow for glow only on borders, not entire element */
          filter: drop-shadow(
            0 0 calc(5px * var(--corner-heat-val, 0))
            rgba(226, 74, 66, calc(var(--corner-heat-val, 0) * 0.7))
          );
          /* use scale + scaleX for pulse/stretch effect on heat */
        }

        #top-right {
          top: 0;
          right: 0;
          border-top: 1px solid color-mix(
            in srgb,
            var(--c_red_l1) calc(var(--corner-heat, 0%) * 0.5),
            var(--color_whitesmoke_darken_4)
          );
          border-right: 1px solid color-mix(
            in srgb,
            var(--c_red_l1) calc(var(--corner-heat, 0%) * 0.5),
            var(--color_whitesmoke_darken_4)
          );
          align-items: start;
          justify-content: end;
          filter: drop-shadow(
            0 0 calc(5px * var(--corner-heat-val, 0))
            rgba(226, 74, 66, calc(var(--corner-heat-val, 0) * 0.7))
          );
        }

        #bottom-left {
          bottom: 0;
          left: 0;
          border-bottom: 1px solid color-mix(
            in srgb,
            var(--c_red_l1) calc(var(--corner-heat, 0%) * 0.5),
            var(--color_whitesmoke_darken_4)
          );
          border-left: 1px solid color-mix(
            in srgb,
            var(--c_red_l1) calc(var(--corner-heat, 0%) * 0.5),
            var(--color_whitesmoke_darken_4)
          );
          filter: drop-shadow(
            0 0 calc(5px * var(--corner-heat-val, 0))
            rgba(226, 74, 66, calc(var(--corner-heat-val, 0) * 0.7))
          );
        }

        #bottom-right {
          bottom: 0;
          right: 0;
          border-bottom: 1px solid color-mix(
            in srgb,
            var(--c_red_l1) calc(var(--corner-heat, 0%) * 0.5),
            var(--color_whitesmoke_darken_4)
          );
          border-right: 1px solid color-mix(
            in srgb,
            var(--c_red_l1) calc(var(--corner-heat, 0%) * 0.5),
            var(--color_whitesmoke_darken_4)
          );
          display: flex;
          align-items: end;
          justify-content: end;
          filter: drop-shadow(
            0 0 calc(5px * var(--corner-heat-val, 0))
            rgba(226, 74, 66, calc(var(--corner-heat-val, 0) * 0.7))
          );
        }
      }

      @media (max-width: 576px) {
        .corners-container {
          --marginCorner: 0;

          #top-left {
            top: var(--marginCorner);
            left: var(--marginCorner);
          }

          #top-right {
            top: var(--marginCorner);
            right: var(--marginCorner);
          }

          #bottom-left {
            right: unset;
            left: var(--marginCorner);
            bottom: 45px;
            font-size: 15px;
            font-weight: 500;
            color: var(--color_whitesmoke_darken_4);
          }

          #bottom-right {
            bottom: 45px;
            right: var(--marginCorner);
            color: var(--color_whitesmoke_darken_4);
            font-size: 15px;
            font-weight: 500;
            z-index: 9999;
          }
        }
      }
    `,
  ],
  template: `
    <div
      class="corners-container"
      [style.--corner-heat]="heatPercent()"
      [style.--corner-heat-val]="heatVal()">
      <div id="top-left" class="camera-corner">
        <app-camera-rec />
      </div>

      <div id="top-right" class="camera-corner">
        <app-camera-battery />
      </div>

      <div id="bottom-left" class="camera-corner">
        <app-camera-quality-resolution id="quality-resolution" />
      </div>

      <div id="bottom-right" class="camera-corner">
        <app-camera-timer />
      </div>
    </div>
  `,
})
export class CameraCornersLayerComponent {
  private readonly mouseHeat = inject(MouseHeatService);

  // use computed because it derives the CSS percentage string reactively from heat;
  // color-mix() needs a percentage like "45%" — computed recalculates only when heat changes
  readonly heatPercent = computed(() => {
    const h = this.mouseHeat.heat();
    return h > 0 ? `${Math.round(h * 100)}%` : '0%';
  });

  // use computed for raw numeric value; used by transform and filter for animation
  readonly heatVal = computed(() => {
    const h = this.mouseHeat.heat();
    return Math.round(h * 100) / 100;
  });
}
