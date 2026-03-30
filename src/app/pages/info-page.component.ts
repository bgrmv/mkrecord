import { ChangeDetectionStrategy, Component } from '@angular/core';
import { InfoComponent } from '@features/info.component';

@Component({
  selector: 'app-info-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InfoComponent],
  template: ` <app-info /> `,
  styles: `
    :host {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      width: 100%;
      overflow: hidden;
      padding-top: clamp(20px, 3vh, 40px);
    }
  `,
})
export class InfoPageComponent {}
