# SEO Audit & Phased Implementation Plan — MK Rec Studio

**Site:** MK Rec Studio (mkrecord) — Filmmaker portfolio by Marek Kondratjev  
**Stack:** Angular 20, SSR (CommonEngine), PWA, Azure Web App  
**Audit date:** 2026-05-06

---

## Critical Findings

### 🔴 P0 — Blockers (prevents indexing or breaks sharing)

| # | Issue | Location | Fix |
|---|-------|----------|-----|
| 1 | No `robots.txt` | `src/` | Create `src/robots.txt` |
| 2 | No `sitemap.xml` | `src/` | Create `src/sitemap.xml` |
| 3 | No meta `description` | `src/index.html` | Add global fallback + per-page via `SeoService` |
| 4 | No Open Graph tags | `src/index.html` | Add `og:title`, `og:description`, `og:image`, `og:url`, `og:type` |
| 5 | No structured data (JSON-LD) | `src/index.html` | Add `Organization` + `Person` schema |
| 6 | Images missing `alt` | portfolio, home-brand, timeline | Add descriptive `alt` to every `<img>` |
| 7 | Generic page titles (`"Home"`, `"Info"`) | `app.routes.ts` | Descriptive titles via `SeoService` |

### 🟠 P1 — High priority

| # | Issue | Location | Fix |
|---|-------|----------|-----|
| 8 | No Twitter Card tags | `index.html` | Add `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image` |
| 9 | No canonical tag | `index.html` + `SeoService` | Set `<link rel="canonical">` per page |
| 10 | Social links without `aria-label` | `footer.component.ts` | Add descriptive `aria-label` |
| 11 | No security/SEO headers | `server.ts` | Add `X-Content-Type-Options`, `X-Robots-Tag`, `Cache-Control` |
| 12 | Static files cached 1 year — no per-route headers | `server.ts` | Differential caching: HTML = no-cache, assets = 1y |

### 🟡 P2 — Medium priority

| # | Issue | Location | Fix |
|---|-------|----------|-----|
| 13 | Duplicate `/home` route | `app.routes.ts` | Remove redirect or canonicalize |
| 14 | `noscript` message too bare | `index.html` | Add meaningful fallback content |
| 15 | No `VideoObject` schema per portfolio item | `constants.ts` | Add descriptions + schema at build time |
| 16 | No per-item portfolio pages | `app.routes.ts` | Create `/portfolio/:slug` routes (SEO goldmine) |
| 17 | Web manifest name is lowercase `mkrecord` | `manifest.webmanifest` | Set `"name": "MK Rec Studio"` |

---

## Phase 1 — Foundation (implemented in this PR)

**Goal:** Unblock crawlers, fix critical meta, add structured data.

### 1.1 robots.txt → `src/robots.txt`
```
User-agent: *
Allow: /
Sitemap: https://mkrecord.azurewebsites.net/sitemap.xml
```

### 1.2 sitemap.xml → `src/sitemap.xml`
Static sitemap covering 4 routes. Update `<lastmod>` on each deploy.

### 1.3 index.html global meta
- `<meta name="description">` — site-wide fallback (overridden per page via `SeoService`)
- `<meta name="keywords">` — relevant filmmaker terms
- `<meta name="author">`
- Open Graph: `og:type`, `og:site_name`, `og:locale`, `og:image`
- Twitter Card: `twitter:card`, `twitter:site`
- JSON-LD `Organization` + `Person` schema

### 1.4 SeoService → `src/app/services/seo.service.ts`
Angular `Meta` + `Title` wrapper. Called from each page's `constructor` (SSR-safe — runs before hydration).  
Sets: title, description, keywords, OG tags, canonical link.

### 1.5 Per-page meta via SeoService

| Page | Title | Description |
|------|-------|-------------|
| `/` | LIGHTS × CAMERA × ACTION — MK Rec Studio | Cinematic filmmaker Marek Kondratjev for hire. Mood videos, commercials, events, corporate content and reels. |
| `/info` | About Marek Kondratjev — MK Rec Studio | 10+ years in videography and film. Broadcast camera operator, licensed drone pilot. Clients: LMT, H&M, LOBODA. |
| `/portfolio` | Portfolio — MK Rec Studio | Browse cinematic video work by Marek Kondratjev — brands, events, music videos, reels and short films. |
| `/contacts` | Hire a Filmmaker — MK Rec Studio | Ready to create? Contact Marek Kondratjev for your next commercial, event, or social media video project. |

### 1.6 alt attributes
Every `<img>` must have a descriptive `alt`. Decorative-only images get `alt=""`.

### 1.7 Footer aria-label
Each social icon link needs `aria-label="Telegram"`, `aria-label="YouTube"`, etc.

### 1.8 server.ts headers
- `X-Content-Type-Options: nosniff` on all responses
- HTML routes: `Cache-Control: no-store` (SSR content must not be cached by CDN)
- Static assets: keep `maxAge: 1y` (already hashed)

---

## Phase 2 — Depth (future work)

- **VideoObject schema** — add `description` to each item in `constants.ts`, generate JSON-LD in `portfolio-page.component.ts`
- **Per-portfolio-item pages** — `/portfolio/don-lounge-place` etc. with full OG image (YouTube thumbnail), title, description; massive SEO opportunity for long-tail keywords
- **Dynamic sitemap** — generate `sitemap.xml` at build time via a Node script that reads `constants.ts`; include portfolio item URLs when Phase 2 routes exist
- **OG image** — generate a static `og-image.jpg` (1200×630) with the MK logo on dark background
- **Google Search Console** — submit sitemap after deployment

---

## Implementation Notes

### SeoService — SSR safety
- `inject(DOCUMENT)` to read `document.URL` for canonical — works in both SSR (CommonEngine passes the URL via `APP_BASE_HREF`) and browser
- Called in component `constructor()` (not `ngOnInit`) so it runs during SSR render

### Canonical URL
Set to `https://mkrecord.azurewebsites.net{path}`. If a custom domain is configured later, update `SITE_URL` in `seo.service.ts`.

### Keywords philosophy
Short, specific, intent-driven. Avoid keyword stuffing. Each page has unique keywords that reinforce the page content.

---

## Files changed in Phase 1

| File | Change |
|------|--------|
| `src/robots.txt` | NEW |
| `src/sitemap.xml` | NEW |
| `src/index.html` | meta description, keywords, author, OG, Twitter, JSON-LD |
| `src/app/services/seo.service.ts` | NEW — Meta/Title/Canonical wrapper |
| `src/app/app.routes.ts` | descriptive route titles |
| `src/app/pages/home-page.component.ts` | inject SeoService |
| `src/app/pages/info-page.component.ts` | inject SeoService |
| `src/app/pages/portfolio-page.component.ts` | inject SeoService |
| `src/app/pages/contacts-page.component.ts` | inject SeoService |
| `src/app/features/home-brand.component.ts` | add `alt` to img |
| `src/app/features/portfolio/portfolio.component.html` | add `alt` to img |
| `src/app/features/portfolio-timeline/portfolio-timeline.component.html` | add `alt` to img |
| `src/app/core/footer.component.ts` | add `aria-label` to social links |
| `server.ts` | security headers, HTML no-cache |
| `angular.json` | add `robots.txt` + `sitemap.xml` to assets |
