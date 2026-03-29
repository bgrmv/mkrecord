import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CameraBatteryComponent } from './camera-battery/camera-battery.component';
import { CameraQualityResolutionComponent } from './camera-quality-resolution.component';
import { CameraRecComponent } from './camera-rec.component';
import { CameraTimerComponent } from './camera-timer/camera-timer.component';

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
        width: 100%;
        height: 100%;
        pointer-events: none;
        top: 0;
        left: 0;
        z-index: 9999;
        // use CSS custom properties to brighten entire camera overlay during parallax; affects all child elements
        filter: brightness(var(--corner-brightness, 1));
        opacity: var(--corner-opacity, 0.6);
        transition: opacity 0.3s ease-out, filter 0.3s ease-out;
      }

      .corners-container {
        position: relative;
        height: 100%;

        & > .camera-corner {
          position: absolute;
          width: 110px;
          aspect-ratio: 16 / 9;
          padding: 20px;
          display: flex;
        }

        #top-left {
          top: 0;
          left: 0;
          border-top: 1px solid var(--color_whitesmoke_darken_4);
          border-left: 1px solid var(--color_whitesmoke_darken_4);
        }

        #top-right {
          top: 0;
          right: 0;
          border-top: 1px solid var(--color_whitesmoke_darken_4);
          border-right: 1px solid var(--color_whitesmoke_darken_4);
          align-items: start;
          justify-content: end;
        }

        #bottom-left {
          bottom: 0;
          left: 0;
          border-bottom: 1px solid var(--color_whitesmoke_darken_4);
          border-left: 1px solid var(--color_whitesmoke_darken_4);
        }

        #bottom-right {
          bottom: 0;
          right: 0;
          border-bottom: 1px solid var(--color_whitesmoke_darken_4);
          border-right: 1px solid var(--color_whitesmoke_darken_4);
          display: flex;
          align-items: end;
          justify-content: end;
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
    <div class="corners-container">
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
export class CameraCornersLayerComponent {}
