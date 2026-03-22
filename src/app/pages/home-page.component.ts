import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HomeBrandComponent } from '../features/home-brand.component';

@Component({
  selector: 'app-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HomeBrandComponent],
  styles: `
    :host {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  `,
  template: ` <app-home-brand /> `,
})
export class HomePageComponent {}
