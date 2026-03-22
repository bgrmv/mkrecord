# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Use `pnpm` as the package manager.

```bash
# Development
pnpm start:dev          # Serve with development config
pnpm start:prod         # Serve with production config

# Build
pnpm build:dev          # Build (development)
pnpm build:prod         # Build (production) — used by CI/CD

# SSR
pnpm serve:dev:ssr      # Run SSR server (dev)
pnpm serve:prod:ssr     # Run SSR server (prod)

# Watch mode
pnpm watch              # Rebuild on changes (dev)
```

No lint or test scripts are configured yet. TypeScript strict mode is enforced at compile time.

## Architecture

**mkrecord** is an Angular 20 filmmaker portfolio website with camera-aesthetic UI. It uses SSR (server-side rendering), PWA (service worker), and deploys to Azure Web App via GitHub Actions on push to `main`.

### Key patterns

- **Standalone components** — no NgModules anywhere
- **Zoneless change detection** — `provideZonelessChangeDetection()` in `app.config.ts`; use Angular Signals instead of triggering zones
- **Angular Signals** — reactive state via `signal()` and `toSignal()` from RxJS observables
- **SSR-safe code** — use `PlatformService` to guard browser-only APIs (video, fullscreen, DOM); never call `document`/`window` directly

### Architecture methodology

This project follows **Feature-Sliced Design (FSD)** combined with **CQRS** patterns:

**FSD layers** (top → bottom, upper layers may import only from lower):
1. `pages/` — routable entry points; compose features, no own business logic
2. `features/` — self-contained UI slices (camera overlays, portfolio blocks, intro)
3. `services/` — shared application services (cross-feature state, infrastructure)
4. `shared/` — framework-agnostic utilities: `directives/`, `pipes/`, `utils/`

Rules:
- A `page` may import from `features` and `shared`, never the reverse
- `features` are independent; they must not import from sibling features
- New domain logic → new feature slice, not a growing service

**CQRS** (applied via Angular Signals + RxJS):
- **Queries** — read-only signals exposed from services (`videoSrc`, `hasBackgroundVideos`); components bind to these, never mutate them directly
- **Commands** — methods/actions that mutate state (e.g., triggering navigation, dispatching video change); always go through the service layer
- Components are pure view: they subscribe to query signals and dispatch commands, holding no local state beyond UI interaction

### Service layer (`src/app/services/`)

- `BackgroundService` — rotates background videos every 5 seconds based on current route; disabled on portfolio page
- `PlatformService` — detects browser vs. server, mobile vs. desktop; gate any browser-only code behind this
- `IconService` — registers SVG icons with Angular Material

### Data

Portfolio video metadata lives in `src/app/constants.ts` (video IDs, categories, titles). This is the source of truth for what appears on the site.

### Routing (`src/app/app.routes.ts`)

Four pages: Home, Info, Portfolio, Contacts. The router state drives `BackgroundService` behavior.

### Styling

Global styles are split across `src/styles/` (reset, variables, keyframes, view-transition animations). Material Design 3 theme is customized in `src/styles/theme/`. Component styles live alongside each component.

### SSR

`server.ts` is an Express server using Angular's `CommonEngine`. `app.config.server.ts` provides SSR-specific overrides. The build outputs a `dist/mkrecord/server/server.mjs` bundle.

### PWA

`ngsw-config.json` controls service worker caching: background videos are prefetched, other assets are lazy-loaded.

## Documentation & Rules

All architectural decisions, known issues, and improvement proposals live in `docs/`. **Read the relevant doc before touching any file marked with `// see docs/...`.**

| File | Purpose |
|------|---------|
| [`AGENT.md`](AGENT.md) | Rules for AI agents: teaching comments format (`// use X because Y`). **Mandatory reading.** |
| [`docs/todo/index.md`](docs/todo/index.md) | Master priority list (P0/P1/P2 + FSD/CQRS violations). **Start here before any fix.** |
| [`docs/todo/angular-modern-api.md`](docs/todo/angular-modern-api.md) | Modern Angular API migration audit: `toSignal`, `afterNextRender`, `computed`, `host`, `signal()`. Each item explains **why**. |
| [`docs/todo/tech-debt.md`](docs/todo/tech-debt.md) | Architecture violations: SSR safety, Platform Service, Change Detection, Singleton, CQRS, FSD, CI/CD |
| [`docs/todo/deprecated.md`](docs/todo/deprecated.md) | Dead code inventory per file — unused signals, empty methods, console.logs, commented blocks |
| [`docs/todo/tools-to-use.md`](docs/todo/tools-to-use.md) | Tooling roadmap: angular-eslint, Playwright, es-toolkit, tsconfig flags, path aliases |
| [`docs/improvements/index.md`](docs/improvements/index.md) | Non-blocking best-practice improvements: signals API, CSS architecture, video preloading, virtual scroll |
| [`docs/architecture.md`](docs/architecture.md) | Component hierarchy, data flow diagrams, full tech stack |

### Rules when writing code

1. **SSR safety** — never call `document`/`window` directly; always guard via `PlatformService.isBrowser`. See `docs/todo/tech-debt.md#ssr-safety`.
2. **FSD isolation** — features must not import from sibling features; pages must not contain business logic. See `docs/todo/tech-debt.md#fsd-layer-violations`.
3. **CQRS** — components are read-only; they bind to service signals (queries) and call service methods (commands). No writable signals with application state in components. See `docs/todo/tech-debt.md#cqrs--state-ownership-violations`.
4. **No new `console.log`** in production code. Guard debug output behind `isDevMode()`.
5. **OnPush required** — every new component must have `changeDetection: ChangeDetectionStrategy.OnPush`.
6. **`inject()` over constructor** — use `inject()` for all dependency injection; no constructor parameters for DI.
7. **Input signals** — use `input()` / `input.required()` instead of `@Input()` decorator.
8. **Annotate issues** — any code that falls under an existing todo must be tagged `// see docs/todo — P# #N`.
9. **Teaching comments** — when replacing a legacy pattern with a modern API, add `// use <API> because <reason>` so the change teaches the developer. See [`AGENT.md`](AGENT.md) for format and examples.
10. **Modern Angular APIs** — prefer `afterNextRender()` over `ngOnInit`/`ngAfterViewInit` for browser-only code, `toSignal()` over `async` pipe, `computed()` over imperative `subscribe()` → `signal.set()`, `host` property over `@HostListener`. See [`docs/todo/angular-modern-api.md`](docs/todo/angular-modern-api.md).

## Deployment

CI/CD runs on push to `main` via `.github/workflows/main_mkrecord.yml`:
1. `pnpm build:prod`
2. Deploy artifact to Azure Web App (federated auth)
