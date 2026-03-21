# Todo — Priority List

This is the master list. Each item links to a detailed section in the sibling docs.
Add `// see docs/todo — P# #N` comments at the referenced file:line in source code.

---

## P0 — Critical (fix before next deployment)

These will crash SSR or silently show wrong content in production.

| # | Issue | File:line | Detail |
|---|-------|-----------|--------|
| 1 | `document.getElementById` without SSR guard | `features/intro/intro.component.ts:14` | [tech-debt.md#ssr-safety](tech-debt.md#ssr-safety) |
| 2 | `window.innerWidth/innerHeight` without SSR guard | `shared/directives/parrallax-item.directive.ts:46-47` | [tech-debt.md#ssr-safety](tech-debt.md#ssr-safety) |
| 3 | `document.*` in fullscreen utility | `shared/utils/fullscreen-api.ts:31-34,41,54-55` | [tech-debt.md#ssr-safety](tech-debt.md#ssr-safety) |
| 4 | `PlatformService` implementation missing (only spec exists) | `services/platform.service.spec.ts:1` | [tech-debt.md#platform-service](tech-debt.md#platform-service) |
| 5 | Hardcoded `videoId="rFGxVhX-cIo"` ignores `data.videoId` (dialog always shows wrong video) | `core/video-dialog.component.ts:95` | [deprecated.md#corevideo-dialog-componentts](deprecated.md#corevideo-dialog-componentts) |
| 6 | `while(true)` infinite loop in `getRandomVideoSrc` | `services/background-service.ts:13` | [tech-debt.md#ssr-safety](tech-debt.md#ssr-safety) |

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
| 21 | Missing path aliases in `tsconfig.json` | `tsconfig.json` | [tools-to-use.md#6-typescript-path-aliases](tools-to-use.md#6-typescript-path-aliases) |
| 22 | Missing strict tsconfig flags (`noUnusedLocals`, `noUnusedParameters`, `exactOptionalPropertyTypes`) | `tsconfig.json` | [tools-to-use.md#5-typescript-strict-flags](tools-to-use.md#5-typescript-strict-flags) |
| 23 | Typo `deviceSerivce` (missing 'i') | `core/video-dialog.component.ts:120`, `pages/portfolio-page.component.ts:142` | — |

---

## FSD Layer Violations

| # | Violation | File:line | Detail |
|---|-----------|-----------|--------|
| F1 | Feature imports sibling feature (`PortfolioTimelineComponent`) | `features/home-brand.component.ts:2-3,7` | [tech-debt.md#fsd-layer-violations](tech-debt.md#fsd-layer-violations) |
| F2 | Page contains device-detection business logic | `pages/portfolio-page.component.ts:142,148-149` | [tech-debt.md#fsd-layer-violations](tech-debt.md#fsd-layer-violations) |

---

## CQRS Violations

Components must not own or mutate writable signals encoding application state.

| # | Violation | File:line | Detail |
|---|-----------|-----------|--------|
| C1 | `batterySignal`/`batteryIcon` mutated inside component | `features/camera-battery/camera-battery.component.ts:51-66` | [tech-debt.md#cqrs--state-ownership-violations](tech-debt.md#cqrs--state-ownership-violations) |
| C2 | `timerSignal` mutated via interval in component | `features/camera-timer/camera-timer.component.ts:31,49-51` | [tech-debt.md#cqrs--state-ownership-violations](tech-debt.md#cqrs--state-ownership-violations) |
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

## Improvements (non-blocking enhancements)

See: [../improvements/index.md](../improvements/index.md)

Key items:
1. `resource()` API for async data loading
2. `linkedSignal()` for derived writable state
3. `PlatformService` implementation (unblocks P0 #4)
4. Camera components consolidation → `CameraOverlayComponent`
5. Video preloading before 5s interval fires
6. Virtual scroll / IntersectionObserver for portfolio videos
7. Loading skeleton for video thumbnails
8. CSS `@layer` cascade organization + container queries
9. Contacts form wired to backend

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
