# Technical Debt

## 📌 Context: What's Working Well

Before diving into issues, know what's production-ready:

✅ **Strengths:**
- Signals API (signal, computed, toSignal, linkedSignal) — excellent adoption
- OnPush + Zoneless change detection — well configured
- Standalone components with clean imports — 100% adoption
- Dependency injection with inject() — consistent across all layers
- Type safety with strict mode — properly configured
- RxJS cleanup (takeUntilDestroyed) — good discipline
- Modern template control flow (@if, @for, @switch) — 100% coverage
- Input/output signal APIs (input(), viewChild()) — no legacy decorators
- Lazy image loading — implemented in portfolio

**See:** [../best-practices.md](../best-practices.md) for the full audit.

---

## SSR Safety

**Rule:** Never call `document.*` or `window.*` directly. Always guard with `PlatformService` or `isPlatformBrowser(inject(PLATFORM_ID))`.

### Violations

**`features/intro/intro.component.ts:14`**
```ts
const videoTarget = document.getElementById('vid');
```
Called unconditionally in `onPlay()`. The Angular SSR engine renders this component on the server where `document` is undefined.
Fix: inject `PlatformService`, guard with `if (platformService.isBrowser)`.

---

**`shared/directives/parrallax-item.directive.ts:46-47`**
```ts
const screenX = window.innerWidth;
const screenY = window.innerHeight;
```
Inside `@HostListener('document:mousemove')` — fires on SSR during hydration on some versions.
Fix: check `isPlatformBrowser` before accessing `window`, or use Angular CDK `BreakpointObserver`.

---

**`shared/utils/fullscreen-api.ts:31-34, 41, 54-55`**
```ts
document.fullscreenElement       // line 31
document.fullscreenEnabled       // line 32
document.querySelectorAll(…)     // line 41
document.fullscreenElement       // line 54
document.exitFullscreen()        // line 55
```
All called at module scope or in exported functions without SSR guard. Called from `IntroComponent` which runs on server.
Fix: wrap all `document` access in `isPlatformBrowser`; or convert the whole file to an `@Injectable` class.

---

## Platform Service

**Status:** Only `services/platform.service.spec.ts` exists. No `platform.service.ts` implementation.

Five components call `isPlatformBrowser(inject(PLATFORM_ID))` directly:
- `app.component.ts:80`
- `features/camera-battery/camera-battery.component.ts:56`
- `features/camera-timer/camera-timer.component.ts:35`
- `features/portfolio-timeline/portfolio-timeline.component.ts:43` (constructor injection)

Required implementation shape (do not write yet — document only):
```ts
@Injectable({ providedIn: 'root' })
export class PlatformService {
  readonly isBrowser: boolean = isPlatformBrowser(inject(PLATFORM_ID));
  readonly isMobile: boolean; // wrapping DeviceDetectorService
}
```

---

## Change Detection

**Missing `ChangeDetectionStrategy.OnPush`** in all components listed below. With `provideZonelessChangeDetection()` set globally, every component without `OnPush` relies on default change detection which does nothing in zoneless — signals alone drive updates, but the absence of `OnPush` is misleading and non-compliant with the project architecture.

- `core/header.component.ts:4`
- `core/footer.component.ts:6`
- `core/nav.component.ts:6`
- `core/nav-mobile.component.ts:6`
- `features/home-brand.component.ts:5`
- `features/camera-quality-resolution.component.ts` — decorator
- `features/camera-rec.component.ts` — decorator
- `features/camera-corners-layer.component.ts` — decorator
- `features/contacts-me.component.ts` — decorator
- `features/info.component.ts` — decorator
- `features/intro/intro.component.ts:5`
- `features/portfolio-block/portfolio-block.component.ts:17`
- `pages/home-page.component.ts` — decorator
- `pages/contacts-page.component.ts` — decorator
- `pages/info-page.component.ts` — decorator
- `pages/portfolio-page.component.ts:20`

`features/portfolio-timeline/portfolio-timeline.component.ts` already has `OnPush` — use it as the reference.

---

## Singleton Violations

**`IconService` dual provider**
- Provided in: `app.component.ts:49` — `providers: [SafePipe, IconService, DeviceDetectorService, BackgroundService]`
- Also provided in: `core/footer.component.ts:9` — `providers: [IconService]`

`IconService` is `@Injectable()` with no `providedIn`. Providing it in two component trees creates two instances; SVG icon registrations run twice and the second call silently overwrites the first.

Fix: add `providedIn: 'root'` to `IconService` decorator, remove from both component `providers` arrays.

---

## DestroyRef Duplicate

**`app.component.ts:52` and `:59`**
```ts
#destroyRef = inject(DestroyRef);   // line 52
private readonly destroyRef = inject(DestroyRef);  // line 59
```
Two separate injections of `DestroyRef`. `#destroyRef` is injected but `destroyRef` is the one actually used in `takeUntilDestroyed(this.destroyRef)` on line 90.
Fix: delete `#destroyRef` on line 52.

---

## CQRS / State Ownership Violations

**Rule:** Components are pure view — they read query signals and call command methods on services. They must not own or mutate writable signals that encode application state.

**`features/camera-battery/camera-battery.component.ts:51-66`**
`batterySignal` and `batteryIcon` are writable signals mutated by a component-owned `interval`. Battery state is application state, not view state.
Fix: move to a `CameraStateService`; expose read-only signals.

---

**`features/camera-timer/camera-timer.component.ts:31,49-51`**
`timerSignal` mutated by an interval inside `ngOnInit`. Timer state should belong to a service.
Fix: extract to `CameraStateService`.

---

**`features/portfolio-block/portfolio-block.component.ts:62-64`**
```ts
dialogRef.afterClosed().subscribe(result => { … });
```
Dialog open/close state managed inline with a bare subscription and no `takeUntilDestroyed`.
Fix: delegate to a `PortfolioDialogService`; or at minimum add `takeUntilDestroyed`.

---

**`features/portfolio-timeline/portfolio-timeline.component.ts:48-58`**
`activePreview` signal and the rotation `interval` are managed inside the component.
Fix: move to `PortfolioService`.

---

**`features/portfolio/portfolio.component.ts:58-92`**
Scroll position and `disabledLeft`/`disabledRight` flags mutated in component event handlers.
Fix: extract to a `ScrollService` or replace with CSS `scroll-snap`.

---

## FSD Layer Violations

**Rule:** Upper layers may import only from lower layers. `pages > features > services > shared`. Siblings must not import each other.

**`features/home-brand.component.ts:2-3,7`**
```ts
import { PortfolioTimelineComponent } from './portfolio-timeline/portfolio-timeline.component';
import { ParallaxItemDirective } from '../shared/directives/parrallax-item.directive';
// imports: [PortfolioTimelineComponent, ParallaxItemDirective],
```
`HomeBrandComponent` (feature) imports `PortfolioTimelineComponent` (sibling feature). Cross-feature imports violate FSD isolation. Note: both imports are also unused in the template — see `docs/todo/deprecated.md`.

---

**`pages/portfolio-page.component.ts:142,148-149`**
```ts
private readonly deviceSerivce = inject(DeviceDetectorService);
public readonly gridView = signal<string>(
  this.deviceSerivce.isMobile() ? '1' : '3'
);
```
Pages should not contain device-detection business logic. This belongs in a layout feature or `PlatformService`.

---

## CI/CD

**`.github/workflows/main_mkrecord.yml:24-27`**
```yaml
- name: npm install, build, and test
  run: |
    npm install
    npm run build:prod --if-present
```
Project uses `pnpm` (`pnpm-lock.yaml` present, `CLAUDE.md` specifies `pnpm`). Using `npm` ignores the lockfile and may install different dependency versions than local dev.

Fix:
```yaml
- name: Set up pnpm
  uses: pnpm/action-setup@v4
  with:
    version: latest

- name: Install dependencies and build
  run: |
    pnpm install --frozen-lockfile
    pnpm build:prod
```

---

## Service Worker in Dev Mode

**`app.config.ts:31`**
```ts
enabled: true, // isDevMode(),
```
The commented-out `isDevMode()` was the correct value. With `enabled: true`, the service worker registers in every environment including local development, causing stale-cache bugs during development.

Fix: `enabled: !isDevMode()`
