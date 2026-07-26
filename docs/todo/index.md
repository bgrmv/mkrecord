# Todo — Priority List

This is the master list. Each item links to a detailed section in the sibling docs.
Add `// see docs/todo — P# #N` comments at the referenced file:line in source code.

**START HERE:** [../best-practices.md](../best-practices.md) — comprehensive audit of Angular 21 best practices usage (what works, what's missing, what needs fixing).

---

## P0 — Critical (fix before next deployment)

These will crash SSR or silently show wrong content in production.

| # | Issue | File:line | Detail | Status |
|---|-------|-----------|--------|--------|
| 1 | `document.getElementById` without SSR guard | `features/intro/intro.component.ts` | [tech-debt.md#ssr-safety](tech-debt.md#ssr-safety) | ✅ Fixed — `PlatformService.isBrowser` guard |
| 2 | `window.innerWidth/innerHeight` without SSR guard | `shared/directives/parrallax-item.directive.ts` | [tech-debt.md#ssr-safety](tech-debt.md#ssr-safety) | ✅ Fixed — `isBrowser` guard + `afterNextRender()` |
| 3 | `document.*` in fullscreen utility | `shared/utils/fullscreen-api.ts` | [tech-debt.md#ssr-safety](tech-debt.md#ssr-safety) | ✅ Fixed — `typeof document` guards |
| 4 | `PlatformService` implementation missing | `services/platform.service.ts` | [tech-debt.md#platform-service](tech-debt.md#platform-service) | ✅ Fixed — implemented with `isBrowser` + `isMobile` |
| 5 | Hardcoded `videoId="rFGxVhX-cIo"` ignores `data.videoId` (dialog always shows wrong video) | `entities/portfolio-block/video-dialog.component.ts:95` | [deprecated.md#entitiesportfolio-blockvideo-dialog-componentts](deprecated.md#entitiesportfolio-blockvideo-dialog-componentts) | ❌ |
| 6 | `while(true)` infinite loop in `getRandomVideoSrc` | `services/background-service.ts:14` | [tech-debt.md#ssr-safety](tech-debt.md#ssr-safety) | ❌ |

---

## P1 — High (architecture / production bugs)

| # | Issue | File:line | Detail |
|---|-------|-----------|--------|
| 7  | Duplicate `DestroyRef` injection — two different names | `app.component.ts:52,59` | [tech-debt.md#destroyref-duplicate](tech-debt.md#destroyref-duplicate) |
| 8  | Constructor injection instead of `inject()` | `features/portfolio/portfolio.component.ts:28` | [deprecated.md#featuresportfolioportfolio-componentts](deprecated.md#featuresportfolioportfolio-componentts) |
| 9  | `VideoService` injected but doesn't exist in codebase | `features/portfolio/portfolio.component.ts:27` | [deprecated.md#featuresportfolioportfolio-componentts](deprecated.md#featuresportfolioportfolio-componentts) |
| 10 | Missing `ChangeDetectionStrategy.OnPush` (15 components) | header, footer, nav, nav-mobile, home-brand, camera-*, pages | [tech-debt.md#change-detection](tech-debt.md#change-detection) |
| 11 | `IconService` provided twice — breaks singleton | `app.component.ts:49`, `core/footer.component.ts:9` | [tech-debt.md#singleton-violations](tech-debt.md#singleton-violations) |
| 12 | Service worker `enabled: true` — registers in dev mode | `app.config.ts:31` | [tech-debt.md#service-worker-in-dev-mode](tech-debt.md#service-worker-in-dev-mode) |
| 13 | CI/CD uses `npm` instead of `pnpm` | `.github/workflows/main_mkrecord.yml:24-27` | [tech-debt.md#cicd](tech-debt.md#cicd) |

---

## P2 — Medium

| # | Issue | File:line | Detail |
|---|-------|-----------|--------|
| 14 | Magic numbers not extracted to named constants (`5000`, `1500`, `3000`, `1000`, `800`) | background-service.ts, camera-battery, camera-timer, portfolio | [tech-debt.md](tech-debt.md) |
| 15 | Unused `Subject unsubscribe` declared but never called | `features/portfolio-timeline/portfolio-timeline.component.ts:41` | [deprecated.md](deprecated.md) |
| 16 | `[attr.playbackRate]` is a no-op — must use JS property binding | `features/portfolio-block/portfolio-block.component.html:55` | [deprecated.md](deprecated.md) |
| 17 | No `catchError` in observable chains | `services/background-service.ts:46-54`, `features/portfolio-block/portfolio-block.component.ts:62` | [tech-debt.md#cqrs--state-ownership-violations](tech-debt.md#cqrs--state-ownership-violations) |
| 18 | 10+ `console.log` calls in production code paths | multiple files | [deprecated.md#consolelog-pollution](deprecated.md#consolelog-pollution) |
| 19 | Empty `openDialog()` body — method does nothing | `features/portfolio/portfolio.component.ts:48` | [deprecated.md](deprecated.md) |
| 20 | Contacts form only calls `preventDefault`, never sends data | `features/contacts-me.component.ts:124` | [improvements/index.md#8-contacts-form--wire-to-backend](../improvements/index.md#8-contacts-form--wire-to-backend) |
| 21 | ~~Missing path aliases in `tsconfig.json`~~ | `tsconfig.json` | [tools-to-use.md#6-typescript-path-aliases](tools-to-use.md#6-typescript-path-aliases) | ✅ Done |
| 22 | Missing strict tsconfig flags (`noUnusedLocals`, `noUnusedParameters`, `exactOptionalPropertyTypes`) | `tsconfig.json` | [tools-to-use.md#5-typescript-strict-flags](tools-to-use.md#5-typescript-strict-flags) |
| 23 | Typo `deviceSerivce` (missing 'i') | `entities/portfolio-block/video-dialog.component.ts:120`, `pages/portfolio-page.component.ts:142` | — |

---

## FSD Layer Violations

**All fixed** — see [tech-debt.md#fsd-layer-violations](tech-debt.md#fsd-layer-violations):
- F1: `home-brand.component.ts` no longer imports sibling feature `PortfolioTimelineComponent`.
- F2: `portfolio-page.component.ts` now derives desktop/mobile from `PlatformService` instead of injecting `DeviceDetectorService` directly.
- F3: `camera-corners-layer`, `camera-quality-resolution`, `camera-rec`, `camera-battery/`, `camera-timer/` and `contacts-captcha.component.ts` were single-consumer children reached via `../` cross-slice imports; consolidated into `features/camera-overlay/` and `features/contacts-me/` respectively.

---

## CQRS Violations

Components must not own or mutate writable signals encoding application state.

| # | Violation | File:line | Detail |
|---|-----------|-----------|--------|
| C1 | `batterySignal`/`batteryIcon` mutated inside component | `features/camera-overlay/camera-battery/camera-battery.component.ts:51-66` | [tech-debt.md#cqrs--state-ownership-violations](tech-debt.md#cqrs--state-ownership-violations) |
| C2 | `timerSignal` mutated via interval in component | `features/camera-overlay/camera-timer/camera-timer.component.ts:31,49-51` | [tech-debt.md#cqrs--state-ownership-violations](tech-debt.md#cqrs--state-ownership-violations) |
| C3 | Dialog open/close subscribed inline — no `takeUntilDestroyed` | `features/portfolio-block/portfolio-block.component.ts:62-64` | [tech-debt.md#cqrs--state-ownership-violations](tech-debt.md#cqrs--state-ownership-violations) |
| C4 | Portfolio rotation interval owned by component | `features/portfolio-timeline/portfolio-timeline.component.ts:48-58` | [tech-debt.md#cqrs--state-ownership-violations](tech-debt.md#cqrs--state-ownership-violations) |
| C5 | Scroll state mutations in component event handlers | `features/portfolio/portfolio.component.ts:58-92` | [tech-debt.md#cqrs--state-ownership-violations](tech-debt.md#cqrs--state-ownership-violations) |

---

## Dead Code

See full inventory: [deprecated.md](deprecated.md)

Quick count:
- 11 files with unused signals, empty methods, or commented blocks
- 11 files with `console.log` in production paths
- 2 files with spurious HTML attributes (`home`)
- 1 unreachable template branch (`video-dialog.component.ts`)

---

## Angular Modern API — Migration Audit

See: [angular-modern-api.md](angular-modern-api.md)

Where to replace legacy/suboptimal patterns with modern Angular APIs. Each item explains **why** — so every change is a learning moment.

| Priority | # | What | File | API |
|----------|---|------|------|-----|
| **High** | A1 | `async` pipe → `toSignal()` | `camera-quality-resolution.component.ts:27` | `toSignal()` |
| **High** | B1 | `ngAfterViewInit`/`ngOnDestroy` → `afterNextRender()` + `DestroyRef` | `portfolio-block.component.ts:47` | `afterNextRender()` |
| **High** | B2 | `ngOnInit` DOM styles → `afterNextRender()` | `parrallax-item.directive.ts:19` | `afterNextRender()` |
| **High** | B3 | `ngOnInit` + isBrowser guard → `afterNextRender()` | `app.component.ts:73` | `afterNextRender()` |
| **High** | K1 | Mutable class fields → `signal()` | `portfolio.component.ts:32-33` | `signal()` |
| Medium | C1 | `ngOnInit` subscription → constructor | `camera-battery.component.ts:57` | `takeUntilDestroyed()` |
| Medium | C2 | `ngOnInit` subscription → constructor | `camera-timer.component.ts:34` | `takeUntilDestroyed()` |
| Medium | C3 | `ngOnInit` subscription → constructor | `portfolio-timeline.component.ts:43` | `takeUntilDestroyed()` |
| Medium | D1 | `@HostListener` → `host` property | `portfolio.component.ts:35` | `host` |
| Medium | D2 | `@HostListener` → `host` property | `parrallax-item.directive.ts:25` | `host` |
| Medium | E1 | `subscribe()` → `toSignal()` + `computed()` | `camera-battery.component.ts:65` | `toSignal()` + `computed()` |
| Medium | E2 | `subscribe()` → `toSignal()` | `camera-timer.component.ts:50` | `toSignal()` |
| Low | H1 | Reactive Forms → Signal Forms | `contacts-me.component.ts:195` | signal forms (wait) |
| Low | I1 | Uncomment `effect()` + `untracked()` | `app.component.ts:59` | `effect()` |

---

## Improvements (non-blocking enhancements)

See: [../improvements/index.md](../improvements/index.md)

Key items:
1. `resource()` API for async data loading
2. `linkedSignal()` for derived writable state — **done** in `portfolio-page.component.ts:157`
3. `PlatformService` implementation — **done** in `services/platform.service.ts`
4. Camera components consolidation → `CameraOverlayComponent`
5. Video preloading before 5s interval fires
6. Virtual scroll / IntersectionObserver for portfolio videos
7. Loading skeleton for video thumbnails
8. CSS `@layer` cascade organization + container queries
9. Contacts form wired to backend
10. SSR-safe RxJS utilities — **done** in `shared/utils/ssr-rxjs.ts` (`browserInterval`)

---

## UI / Visual Issues

See: [ui.md](ui.md)

Reported visual, layout, typography, and feature issues:

| Group | Count | Examples |
|-------|-------|---------|
| Desktop UI | 12 | Logotype size, inactive tab color, Info layout, fonts |
| Mobile UI | 7 | Corner sizing, dvh fonts, parallax off, prefetch |
| Portfolio features | 2 | Vertical videos, larger titles |
| About Me | 4 | Scrolling, bio text, mobile font size |
| Contact Me | 4 | Name/phone fields, cache, send animation |
| Legal | 1 | Cookies / Terms & Conditions |
| Navigation blocked | 1 | z-index stacking context audit |

---

## Tooling to Add

See: [tools-to-use.md](tools-to-use.md)

| Tool | Priority | Blocks |
|------|----------|--------|
| `@angular-eslint` | High | Catches P1 #10 automatically |
| `noUnusedLocals` tsconfig flag | High | Surfaces P2 #22, all dead code |
| Playwright | Medium | E2E coverage for portfolio |
| `source-map-explorer` | Medium | Bundle regression tracking |
| `es-toolkit` | Low | Fix P0 #6 `while(true)` |
| TypeScript path aliases | Low | DX improvement |
