import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { environment } from '../../environments/environment';

export interface SeoConfig {
  title: string;
  description: string;
  keywords?: string;
  path?: string;
}

const SITE_NAME = 'MK Rec Studio';
const { siteUrl } = environment;
const OG_IMAGE = `${siteUrl}/assets/brand/mk-white.png`;
// WhatsApp and Telegram both read og:* tags — no platform-specific meta needed.
// Twitter/X reads twitter:* tags with og:* as fallback.
const OG_IMAGE_ALT = 'MK Rec Studio — cinematic video production by Marek Kondratjev';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  // use inject(DOCUMENT) because it is SSR-safe: CommonEngine provides the server document
  private readonly document = inject(DOCUMENT);

  set(config: SeoConfig): void {
    const fullTitle = `${config.title} — ${SITE_NAME}`;
    const url = `${siteUrl}${config.path ?? '/'}`;

    this.title.setTitle(fullTitle);

    this.meta.updateTag({ name: 'description', content: config.description });
    if (config.keywords) {
      this.meta.updateTag({ name: 'keywords', content: config.keywords });
    }

    this.meta.updateTag({ property: 'og:title', content: fullTitle });
    this.meta.updateTag({ property: 'og:description', content: config.description });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:image', content: OG_IMAGE });
    this.meta.updateTag({ property: 'og:image:alt', content: OG_IMAGE_ALT });

    this.meta.updateTag({ name: 'twitter:title', content: fullTitle });
    this.meta.updateTag({ name: 'twitter:description', content: config.description });
    this.meta.updateTag({ name: 'twitter:image', content: OG_IMAGE });
    this.meta.updateTag({ name: 'twitter:image:alt', content: OG_IMAGE_ALT });

    this.setCanonical(url);
  }

  private setCanonical(url: string): void {
    const head = this.document.head;
    let link = head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      head.appendChild(link);
    }
    link.setAttribute('href', url);
  }
}
