import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DashboardComponent } from '@features/dashboard/dashboard.component';
import { SeoService } from '@services/seo.service';

@Component({
  selector: 'app-dashboard-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DashboardComponent],
  template: ` <app-dashboard /> `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
        min-height: 0;
      }
    `,
  ],
})
export class DashboardPageComponent {
  public constructor() {
    inject(SeoService).set({
      title: 'Portfolio Dashboard',
      description: 'Internal editing deck for the mkrecord portfolio.',
      path: '/dashboard',
      // an admin surface must never enter the index, and it carries no ranking value
      robots: 'noindex, nofollow',
    });
  }
}
