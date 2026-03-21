# Improvements — Best Practices

Suggestions tied to existing code patterns in this codebase. These are not fixes for bugs — they are architectural upgrades.

---

## 1. Angular Signal APIs

### `resource()` for async data loading

Angular 19+ `resource()` API provides built-in loading/error states for async operations.

Current pattern in `background-service.ts`:
```ts
public readonly videoSrc = toSignal(
  interval(5000).pipe(map(…))
);
```

`resource()` candidate: any future HTTP data loading (e.g., if portfolio metadata moves from `constants.ts` to an API). It provides `value()`, `isLoading()`, `error()` signals automatically — no `toSignal` + manual `catchError` needed.

---

### `linkedSignal()` for derived writable state

`linkedSignal()` (Angular 19+) creates a writable signal that resets when its source changes — removing the need for manual effect subscriptions.

Candidate in `pages/portfolio-page.component.ts:148-149`:
```ts
// Current: gridView is computed once at construction from deviceService
public readonly gridView = signal<string>(
  this.deviceSerivce.isMobile() ? '1' : '3'
);

// Better: responds to screen size changes reactively
public readonly gridView = linkedSignal(() =>
  this.platformService.isMobile() ? '1' : '3'
);
```

---

### Migrate `@Input()` to `input()` signal API

`features/portfolio-block/portfolio-block.component.ts` already uses `input.required()` — use it as the reference for all remaining `@Input` usages:

- `shared/directives/parrallax-item.directive.ts:18` — `@Input() movement = 0.025` → `movement = input(0.025)`

Any new `@Input` decorators added to the codebase must use `input()` instead.

---

## 2. PlatformService Implementation

Create `src/app/services/platform.service.ts`. This is the single most impactful structural change.

**Required shape:**
```ts
@Injectable({ providedIn: 'root' })
export class PlatformService {
  readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  readonly isMobile: Signal<boolean>; // from DeviceDetectorService or CDK BreakpointObserver
}
```

**Consolidation:**
Replace all direct `isPlatformBrowser(inject(PLATFORM_ID))` call sites:
- `app.component.ts:80`
- `features/camera-battery/camera-battery.component.ts:56`
- `features/camera-timer/camera-timer.component.ts:35`
- `features/portfolio-timeline/portfolio-timeline.component.ts:43`
- `pages/portfolio-page.component.ts:142` (replace `DeviceDetectorService` with `PlatformService.isMobile`)

Once done, consider removing `ngx-device-detector` entirely in favor of Angular CDK `BreakpointObserver` — see `tools-to-use.md#bundle-analysis`.

---

## 3. Camera Components Consolidation

Currently 5 separate camera overlay components are each instantiated in `app.component.ts`:
- `CameraTimerComponent`
- `CameraBatteryComponent`
- `CameraQualityResolutionComponent`
- `CameraRecComponent`
- `CameraCornersLayerComponent`

**Recommended:** Consolidate into a single `CameraOverlayComponent` that owns all five as children.

Benefits:
- One import in `app.component.ts` instead of five
- Single point to show/hide the entire overlay (e.g., hide on portfolio page)
- Camera state service (`CameraStateService`) co-located with the overlay
- Cleaner FSD feature boundary: `features/camera-overlay/`

---

## 4. Video Preloading Strategy

`BackgroundService` switches background video every 5000ms but starts loading the new video at the moment of switch — visible as a blank flash.

**Recommended approach:**
- At `t=3000ms`, compute the next video URL and set it on a hidden `<video>` element to begin buffering
- At `t=5000ms`, swap the visible source to the already-buffered video

Implementation: add a `nextVideoSrc` signal to `BackgroundService`; bind a hidden `<video #preload [src]="nextVideoSrc()">` in `app.component.html`.

---

## 5. Virtual Scroll for Portfolio

`portfolio-block.component.html` renders all videos simultaneously with `autoplay`. With 9+ horizontal + 8+ vertical videos all autoplaying, this creates significant memory and CPU pressure.

**Recommended:** Use Angular CDK `VirtualScrollViewport` or `IntersectionObserver` to:
- Only autoplay videos currently in the viewport
- Pause/unload videos that scroll out of view

```ts
// Minimal IntersectionObserver approach per video element:
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => e.isIntersecting ? video.play() : video.pause());
});
observer.observe(videoEl);
```

Guard the observer with `PlatformService.isBrowser`.

---

## 6. Loading Skeletons for Videos

Video thumbnails have no loading state — users see blank or black boxes until the video loads.

**Recommended:**
- Add a CSS `skeleton` placeholder (pulsing gradient animation) shown on `:host` before the video fires `canplay`
- Use `(canplay)` event binding to remove the skeleton class
- Pure CSS — no JavaScript state needed:
```css
.preview:not(.loaded) { background: linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%); animation: shimmer 1.5s infinite; }
```

---

## 7. CSS Architecture Modernization

### Replace Meyer Reset (2011) with modern baseline

`src/styles/reset.css` uses the Eric Meyer reset from 2011. It includes IE 6/7/8 compatibility rules irrelevant to modern browsers.

**Replace with:**
```css
@layer reset {
  *, *::before, *::after { box-sizing: border-box; }
  * { margin: 0; }
  body { line-height: 1.5; -webkit-font-smoothing: antialiased; }
  img, picture, video, canvas, svg { display: block; max-width: 100%; }
  input, button, textarea, select { font: inherit; }
  p, h1, h2, h3, h4, h5, h6 { overflow-wrap: break-word; }
}
```

---

### @layer cascade organization

Current global styles have no cascade layer order, making specificity conflicts hard to debug.

Add to `src/styles.css`:
```css
@layer reset, base, theme, components, utilities;
```

Then wrap existing files:
- `reset.css` → `@layer reset { … }`
- `variables.css`, `font.css` → `@layer base { … }`
- Material theme → `@layer theme { … }`
- Component styles → `@layer components { … }`

---

### Container queries for portfolio blocks

`portfolio-block.component.css` uses viewport breakpoints (`max-width: 576px`). Container queries allow each block to respond to its own available width, making the component reusable at any layout size.

```css
/* In portfolio-block.component.css */
:host {
  container-type: inline-size;
}

@container (max-width: 600px) {
  .grid.view-3 { grid-template-columns: 1fr; }
}
```

---

### CSS `@property` for animated camera overlay values

Battery blink and rec indicator animations are driven by JavaScript intervals. `@property` (CSS Houdini) allows CSS transitions on custom properties, enabling pure-CSS animations.

```css
@property --battery-opacity {
  syntax: '<number>';
  inherits: false;
  initial-value: 1;
}

.battery-icon {
  opacity: var(--battery-opacity);
  transition: --battery-opacity 0.3s;
}
```

---

### `color-mix()` consistency

`src/styles/variables.css` uses both `color-mix()` (lines 35-43) and raw `rgba()` (lines 12-27) for the same semantic purpose. Standardize on `color-mix()`:

```css
/* Before */
--color_whitesmoke_darken_1: rgba(245, 245, 245, 0.9);

/* After */
--color_whitesmoke_darken_1: color-mix(in srgb, whitesmoke 90%, black);
```

---

### Responsive breakpoint custom properties

The breakpoint value `576px` appears hardcoded in at least 6 separate component style blocks. Define once in `variables.css`:

```css
/* Note: CSS custom properties can't be used inside @media conditions directly.
   Use a PostCSS plugin (postcss-custom-media) or document the value here for
   reference and use it consistently. */
/* --breakpoint-mobile: 576px; */
```

With container queries adopted (see above), most viewport breakpoints become unnecessary.

---

## 8. Contacts Form — Wire to Backend

`contacts-me.component.ts:124` — the form's submit handler only calls `$event.preventDefault()`. The form collects email and message but sends nothing.

**Recommended implementation options (in order of complexity):**
1. **EmailJS** — client-side, no backend needed, free tier sufficient for portfolio
2. **Formspree** — HTML form POST, zero JavaScript
3. **Azure Function** — consistent with existing Azure deployment, full control

Add to the component:
- `isSubmitting` signal (loading state)
- `submitError` / `submitSuccess` signals (feedback)
- `HttpClient.post()` or EmailJS SDK call in `onSubmit()`

Validate with Angular reactive forms validators already partially configured (`formGroup` exists).
