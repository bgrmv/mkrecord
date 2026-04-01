import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NavComponent } from './nav.component';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NavComponent],
  styles: [
    `
      @keyframes letterbox-reveal {
        from {
          clip-path: polygon(0 50%, 100% 50%, 100% 50%, 0 50%);
        }
        to {
          clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
        }
      }

      header {
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        top: 0;
        height: 100%;
        padding: 0 clamp(20px, 3vw, 40px);
        z-index: 9999;
        background: linear-gradient(
          180deg,
          rgba(0, 0, 0, 0.7) 0%,
          rgba(0, 0, 0, 0.5) 50%,
          rgba(0, 0, 0, 0.3) 100%
        );
        border-bottom: 1px solid rgba(224, 78, 66, 0.15);
        backdrop-filter: blur(8px);
        animation: letterbox-reveal 600ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        transform: perspective(1px) translateZ(0);
        will-change: backdrop-filter;

        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(
            to right,
            transparent 0%,
            rgba(224, 78, 66, 0.2) 50%,
            transparent 100%
          );
        }

        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(
            to right,
            transparent 0%,
            rgba(224, 78, 66, 0.2) 50%,
            transparent 100%
          );
        }
      }

      @media (max-width: 576px) {
        app-nav {
          display: none;
        }

        header {
          padding: clamp(10px, 1.5vh, 15px) clamp(15px, 2vw, 30px);
        }
      }
    `,
  ],
  template: `<header>
    <app-nav />
  </header>`,
})
export class HeaderComponent {}
