import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-camera-rec',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  styles: [
    `
      :host {
        position: relative;
        font-family: var(--font-display);
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 5px;

        color: var(--color_whitesmoke_darken_4);

        animation: rec 3s infinite forwards step-end;

        img.rec-dot {
          width: 24px;
        }

        .rec-word {
          font-weight: 100;
          font-family: var(--font-display);
          color: var(--c_red);
        }
      }

      @keyframes rec {
        0% {
          filter: none;
        }

        50% {
          filter: grayscale(1) brightness(1);
        }
      }
    `,
  ],
  template: `
    <img class="rec-dot" src="assets/brand/dot.svg" alt="" />
    <span class="rec-word">REC</span>
  `,
})
export class CameraRecComponent {}
