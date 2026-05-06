import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ContactsMeComponent } from '@features/contacts-me.component';
import { SeoService } from '@services/seo.service';

@Component({
  selector: 'app-contacts-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ContactsMeComponent],
  template: ` <app-contacts-me /> `,
  styles: [
    `
      :host {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
      }
    `,
  ],
})
export class ContactsPageComponent {
  constructor() {
    inject(SeoService).set({
      title: 'Hire a Filmmaker',
      description: 'Ready to create? Contact filmmaker Marek Kondratjev for your next commercial, corporate video, event coverage or social media project.',
      keywords: 'hire filmmaker, hire videographer, video production contact, commission video, book videographer',
      path: '/contacts',
    });
  }
}
