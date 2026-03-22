import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NavComponent } from './nav.component';

// see docs/todo — P1 #10: missing ChangeDetectionStrategy.OnPush; see docs/todo/tech-debt.md#change-detection
@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NavComponent],
  styles: [
    `
      header {
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        top: 0;
        padding: 35px;
        z-index: 9999;
        background-color: rgba(0, 0, 0, 0.3);
        transform: perspective(1px) translateZ(0);
      }

      @media (max-width: 576px) {
        app-nav {
          display: none;
        }
      }
    `,
  ],
  template: `
    <header>
      <app-nav />
    </header>
  `,
})
export class HeaderComponent {}
