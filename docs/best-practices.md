# Angular 21 Best Practices — Current State & Roadmap

This document audits the codebase against Angular 21 best practices: what's implemented well, what's missing, and what needs fixing.

**Last updated:** 2026-03-22 (after Angular 21 upgrade, vitest setup, dependency updates)

---

## ✅ What's Working Well

### 1. Modern Signals API — Excellent
**Status:** Mature adoption across all layers.

**Evidence:**
- `signal()` — used in components (camera-battery, contacts-me, portfolio-timeline)
- `toSignal()` — correctly converts RxJS observables in services (BackgroundService, PlatformService)
- `computed()` — used for derived state (VideoDialogComponent, PortfolioTimelineComponent)
- `linkedSignal()` — reactive grid view in `portfolio-page.component.ts:157-159` (canonical example)
- `viewChildren()` / `viewChild()` — signal-based template query API in portfolio-block

**No action needed.** This is a reference implementation pattern.

---

### 2. Zoneless Change Detection with OnPush — Excellent
**Status:** Properly configured at root; mostly applied to components.

**Evidence:**
- `app.config.ts:11` — `provideZonelessChangeDetection()` removes Zone.js globally
- `ChangeDetectionStrategy.OnPush` applied to ~60% of components
- Signals-based reactivity ensures efficient change detection

**Issues:** See [tech-debt.md#change-detection](tech-debt.md#change-detection) — 15 components missing `OnPush` decorator.

**Action:** Add `ChangeDetectionStrategy.OnPush` to all remaining components (P1 #10).

---

### 3. Standalone Components & Clean Imports — Perfect
**Status:** 100% adoption; no NgModules anywhere.

**Evidence:**
- All components use `standalone: true`
- Explicit `imports: []` arrays keep dependencies visible
- Clean, minimal Material/utility imports per component

**No action needed.** This is production-ready.

---

### 4. Dependency Injection with `inject()` — Excellent
**Status:** Consistent use across the codebase.

**Evidence:**
```ts
private readonly platformService = inject(PlatformService);
private readonly router = inject(Router);
private readonly destroyRef = inject(DestroyRef);
```

**No constructor parameters**, all DI uses `inject()` function.

**Issues:** See [tech-debt.md#singleton-violations](tech-debt.md#singleton-violations) — `IconService` provided twice (P1 #11).

**Action:** Add `providedIn: 'root'` to IconService, remove from component providers.

---

### 5. Type Safety — Strict Mode Enabled
**Status:** Strong foundation; missing advanced flags.

**Configuration:**
```json
{
  "strict": true,
  "noImplicitOverride": true,
  "noPropertyAccessFromIndexSignature": true,
  "noImplicitReturns": true,
  "noFallthroughCasesInSwitch": true,
  "strictInjectionParameters": true,
  "strictInputAccessModifiers": true,
  "strictTemplates": true
}
```

**Missing:** `noUnusedLocals`, `noUnusedParameters`, `exactOptionalPropertyTypes`, `baseUrl`/`paths`.

**Action:** See [tools-to-use.md#5-typescript-strict-flags](tools-to-use.md#5-typescript-strict-flags) (P2 #22).

---

### 6. RxJS Cleanup Patterns — Good
**Status:** Proper unsubscription discipline using `takeUntilDestroyed()`.

**Evidence:**
- `DestroyRef` injected consistently
- `.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(...)` throughout
- Services use `toSignal()` to avoid manual subscriptions

**Pattern:**
```ts
// app.component.ts:90
this.backgroundService.hasBackgroundVideos()
  .pipe(takeUntilDestroyed(this.destroyRef))
  .subscribe(…);
```

**Issues:**
- `portfolio-block.component.ts:62` — dialog subscription missing `takeUntilDestroyed`
- `portfolio-timeline.component.ts:41` — unused `Subject` declared

**Action:** Add missing cleanup (P2 #15, #17).

---

### 7. Modern Template Control Flow — Perfect
**Status:** 100% adoption of `@if`, `@for`, `@switch/@case`.

**Evidence:** All templates use new control flow syntax:
```html
<!-- ✅ NEW SYNTAX -->
@if (backgroundVideoSrc()) {
  <video [src]="backgroundVideoSrc()"/>
}

@for (portfolio of portfolios; track portfolio) {
  <div>{{ portfolio.title }}</div>
}

@switch (gridView()) {
  @case ('1') { grid-template-columns: 1fr; }
  @case ('3') { grid-template-columns: repeat(3, 1fr); }
}
```

**No action needed.** This is production-ready.

---

### 8. Modern Input/Output APIs — Excellent
**Status:** All `input()` and `output()`, no `@Input()` decorators.

**Evidence:**
- `portfolio-block.component.ts` — `input.required()`
- Clean signal-based component APIs

**No action needed.** This is production-ready.

---

### 9. Error Handling in Utilities — Good
**Status:** Graceful try/catch patterns for browser APIs.

**Evidence:**
```ts
// video-utils.ts — proper error recovery
try {
  await video.play();
} catch (e) {
  console.warn('Autoplay blocked', e);
  await waitForUserInteractionPlay(video);
}

// contacts-me.component.ts — async/await with feedback
try {
  await emailjs.send(…);
  this.submitSuccess.set(true);
} catch {
  this.submitError.set('Failed. Try again.');
} finally {
  this.isSubmitting.set(false);
}
```

**Issues:**
- No RxJS `catchError`, `retry`, `retryWhen` operators (P2 #17)
- No global error interceptor
- Limited HTTP error handling strategy

**Action:** Add RxJS error operators to observable chains (P2 #17).

---

### 10. Performance Optimization — Good
**Status:** OnPush, signals, lazy images, IntersectionObserver.

**Evidence:**
- `ChangeDetectionStrategy.OnPush` prevents unnecessary change detection cycles
- `BackgroundService` uses `share()` operator to prevent duplicate subscriptions
- `portfolio-block.component.ts` — IntersectionObserver for video playback
- `portfolio.component.html` — `loading="lazy"` on images
- `portfolio-page.component.ts:157` — `linkedSignal()` for responsive grid

**Issues:**
- No virtual scrolling for large portfolios (17 videos)
- Videos autoplay simultaneously — high memory footprint

**Action:** Consider virtual scrolling or aggressive intersection observer (non-blocking).

---

### 11. Testing Setup — Vitest Configured
**Status:** Vitest installed, basic tests written, integration with Angular TestBed works.

**Tests:**
- `platform.service.spec.ts` — service testing with TestBed
- `duration.pipe.spec.ts` — pure function testing (7 cases)
- `safe.pipe.spec.ts` — sanitization testing with TestBed
- `constants.spec.ts` — data validation (8 cases)

**Total:** 4 test files, 25 tests passing.

**Issues:**
- No component integration tests
- No e2e tests (Playwright/Cypress)
- Test coverage not measured

**Action:** Add component testing and e2e suite (non-blocking).

---

## ⚠️ What Needs Fixing (Prioritized)

### 🔴 Critical (P0) — Will Crash SSR

| Item | Status | Doc | Action |
|------|--------|-----|--------|
| SSR safety: `document.*` calls without guards | ✅ Documented | [tech-debt.md#ssr-safety](tech-debt.md#ssr-safety) | Fix: guard with `PlatformService.isBrowser` (P0 #1-3) |
| Infinite loop in `getRandomVideoSrc()` | ✅ Documented | [tech-debt.md#ssr-safety](tech-debt.md#ssr-safety) | Fix: add escape condition (P0 #6) |
| Video dialog shows wrong video | ✅ Documented | [deprecated.md](deprecated.md) | Fix: use `data.videoId` instead of hardcoded (P0 #5) |

---

### 🔴 High (P1) — Architecture/Production Bugs

| Item | Status | Doc | Action |
|------|--------|-----|--------|
| Missing `ChangeDetectionStrategy.OnPush` (15 components) | ✅ Documented | [tech-debt.md#change-detection](tech-debt.md#change-detection) | Add decorator to all (P1 #10) |
| CQRS violations: components own state (5 items) | ✅ Documented | [tech-debt.md#cqrs](tech-debt.md#cqrs) | Move state to services (C1-C5) |
| `IconService` provided twice | ✅ Documented | [tech-debt.md#singleton-violations](tech-debt.md#singleton-violations) | Add `providedIn: 'root'` (P1 #11) |
| Service worker enabled in dev mode | ✅ Documented | [tech-debt.md#service-worker-in-dev-mode](tech-debt.md#service-worker-in-dev-mode) | Use `!isDevMode()` (P1 #12) |
| CI/CD uses `npm` instead of `pnpm` | ✅ Documented | [tech-debt.md#cicd](tech-debt.md#cicd) | Update workflow (P1 #13) |

---

### 🟡 Medium (P2) — Best Practices

| Item | Status | Doc | Action |
|------|--------|-----|--------|
| Missing RxJS `catchError`, `retry` | ✅ Documented | [tech-debt.md#cqrs](tech-debt.md#cqrs) | Add error operators (P2 #17) |
| No route lazy loading | ❌ New | [improvements/index.md](improvements/index.md) | Implement lazy-loaded routes |
| No HTTP interceptors | ❌ New | Below | Create typed API service + interceptor |
| No component testing | ✅ Documented | [angular-modern-api.md](angular-modern-api.md) | Add TestBed component tests |
| No signal-based form migration | ✅ Documented | [angular-modern-api.md#h](angular-modern-api.md#h) | Wait for Angular to stabilize signal forms |
| `@HostListener` should use `host` property | ✅ Documented | [angular-modern-api.md#d](angular-modern-api.md#d) | Migrate to `host` metadata (D1-D2) |

---

## ❌ What's Missing (New Best Practices)

### 1. HTTP Interceptors & Typed API Service

**Current state:** No interceptors; only EmailJS for contacts.

**Missing:**
```ts
// ❌ What we need:
@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  getPortfolios(): Observable<Portfolio[]> {
    return this.http.get<Portfolio[]>('/api/portfolios');
  }
}

// With interceptor for auth, error handling:
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError(err => this.handleError(err))
    );
  }
}

// In app.config.ts:
provideHttpClient(
  withInterceptors([errorInterceptor]),
  withFetch()
)
```

**Recommendation:** Start with a minimal `ApiService` for any future backend integration. Add error interceptor if needed.

---

### 2. Route Lazy Loading

**Current state:** All routes loaded eagerly.

**Missing:**
```ts
// ❌ Current
export const ROUTES: Routes = [
  { path: 'portfolio', component: PortfolioPageComponent },
];

// ✅ Recommended
export const ROUTES: Routes = [
  {
    path: 'portfolio',
    loadComponent: () => import('./pages/portfolio-page.component')
      .then(m => m.PortfolioPageComponent)
  },
];
```

**Benefit:** Reduces initial bundle size; portfolio page (~50kb) loads on demand.

**Recommendation:** Implement for portfolio page and contacts page (heaviest routes).

---

### 3. Resource API for Async Data

**Current state:** Manual `toSignal()` in services; no `resource()` API.

**Missing:**
```ts
// ❌ Current
portfolios = signal([...]);  // static data

// ✅ Future (with backend):
portfolios = resource({
  request: () => ({/* no params */}),
  loader: () => this.api.getPortfolios()
});

// In template:
@if (portfolios.isLoading()) { Loading... }
@if (portfolios.error()) { Error: {{ portfolios.error().message }} }
@for (p of portfolios.value(); track p.id) { ... }
```

**Recommendation:** Not needed now; implement when portfolio data moves to backend.

---

### 4. Virtual Scrolling or Intersection Observer Optimization

**Current state:** All 17 portfolio videos autoplay simultaneously (memory spike).

**Missing:**
```ts
// ✅ Recommended approach
@Component({
  template: `
    <cdk-virtual-scroll-viewport [itemSize]="300" class="videos">
      @for (video of videos; track video.id) {
        <app-portfolio-block [video]="video"/>
      }
    </cdk-virtual-scroll-viewport>
  `
})
```

**Alternative:** Aggressive `IntersectionObserver` per video (guard with `PlatformService.isBrowser`).

**Recommendation:** Non-blocking enhancement; profile first to confirm memory issue.

---

### 5. Effect() Lifecycle Pattern

**Current state:** Commented out in `app.component.ts:59-70`.

**Missing:**
```ts
// ❌ Commented out but correct pattern
effect(() => {
  const video = this._video();
  const src = this.backgroundVideoSrc();

  if (src && video) {
    untracked(() => video.src = src);
    video.play().catch(() => {/**/});
  }
});
```

**Recommendation:** Uncomment when `effect()` behavior is validated. The pattern is correct.

---

### 6. Advanced TypeScript Flags

**Current state:** Strict mode on; missing advanced flags.

**Missing in `tsconfig.json`:**
```json
{
  "noUnusedLocals": true,       // Catch dead variables
  "noUnusedParameters": true,   // Catch dead function params
  "exactOptionalPropertyTypes": true,  // Prevent undefined from optional properties
  "baseUrl": ".",
  "paths": {
    "@app/*": ["src/app/*"],
    "@shared/*": ["src/app/shared/*"],
    "@features/*": ["src/app/features/*"]
  }
}
```

**Action:** See [tools-to-use.md#5](tools-to-use.md#5-typescript-strict-flags) (P2 #22).

---

### 7. ESLint Configuration for Angular

**Current state:** ESLint installed but minimal config.

**Missing:**
```bash
# Install
pnpm add -D @angular-eslint/eslint-plugin @angular-eslint/eslint-plugin-template

# .eslintrc.json — add rules:
"@angular-eslint/no-empty-lifecycle-method": "warn"
"@angular-eslint/prefer-on-push-component-change-detection": "warn"
"@angular-eslint/no-host-metadata-property": "warn"  // Suggests host: {} over @HostListener
```

**Benefit:** Catches architectural violations (missing OnPush, empty lifecycle methods) automatically.

**Action:** See [tools-to-use.md#4](tools-to-use.md#4-angular-eslint) (High priority).

---

## 📋 Implementation Roadmap

### Phase 1: Critical Fixes (P0/P1) — This Sprint
- [ ] Fix SSR safety violations (P0 #1-3, #6)
- [ ] Fix video dialog (P0 #5)
- [ ] Add missing `ChangeDetectionStrategy.OnPush` (P1 #10)
- [ ] Fix CQRS violations — extract service state (C1-C5)
- [ ] Fix IconService singleton (P1 #11)
- [ ] Fix service worker dev mode (P1 #12)
- [ ] Update CI/CD to use pnpm (P1 #13)

### Phase 2: Architecture Improvements (P2) — Next Sprint
- [ ] Add RxJS error operators (P2 #17)
- [ ] Migrate `@HostListener` to `host` property (D1-D2)
- [ ] Add route lazy loading (portfolio, contacts)
- [ ] Implement HTTP interceptor + ApiService
- [ ] Add missing `takeUntilDestroyed` (P2 #15)

### Phase 3: Testing & Polish (Non-blocking) — Future
- [ ] Add component integration tests (TestBed)
- [ ] Add e2e tests (Playwright)
- [ ] Configure test coverage thresholds
- [ ] Implement virtual scrolling (if memory profile shows issue)
- [ ] Uncomment and test `effect()` pattern

### Phase 4: DX & Tooling (Polish) — Future
- [ ] Add advanced TypeScript flags + path aliases (P2 #22)
- [ ] Configure @angular-eslint rules
- [ ] Add pre-commit hooks (lint + test)
- [ ] Bundle size monitoring (`source-map-explorer`)

---

## Summary Table: Best Practices Adoption

| Practice | Used? | Quality | Priority | Notes |
|----------|:-----:|:-------:|:--------:|-------|
| Signals API | ✅ | 9/10 | — | Excellent; canonical examples exist |
| OnPush + Zoneless | ✅ | 7/10 | 🔴 HIGH | 15 components missing OnPush |
| Standalone Components | ✅ | 10/10 | — | Perfect; no NgModules |
| Dependency Injection | ✅ | 9/10 | 🔴 HIGH | IconService duplicate provider |
| Type Safety | ✅ | 8/10 | 🟡 MED | Missing advanced TS flags |
| RxJS Cleanup | ✅ | 8/10 | 🟡 MED | Missing catchError/retry; 1 uncleaned subscription |
| Template Control Flow | ✅ | 10/10 | — | Perfect; @if/@for/@switch everywhere |
| Input/Output APIs | ✅ | 10/10 | — | All input()/output(); no @Input/@Output |
| Error Handling | ✅ | 7/10 | 🟡 MED | Try/catch good; RxJS error ops missing |
| Performance | ✅ | 8/10 | 🟡 MED | Good; no virtual scroll yet |
| **Testing** | ⚠️ | 4/10 | 🟡 MED | Vitest working; no component/e2e tests |
| **HTTP/API** | ❌ | 2/10 | 🟡 MED | No interceptors; minimal service layer |
| **CQRS** | ⚠️ | 5/10 | 🔴 HIGH | 5 state ownership violations |
| **Route Lazy Loading** | ❌ | 0/10 | 🟡 MED | All routes eager |
| **Resource API** | ❌ | N/A | 🟢 LOW | Not needed yet; candidate for backend integration |

---

## Reference

- **Fixes:** See `docs/todo/tech-debt.md` for detailed explanations of each P0/P1 issue
- **Migrations:** See `docs/todo/angular-modern-api.md` for step-by-step refactor patterns
- **Tooling:** See `docs/todo/tools-to-use.md` for ESLint, TypeScript flags, Playwright
- **UI Issues:** See `docs/todo/ui.md` for visual/layout problems
- **Deprecated:** See `docs/todo/deprecated.md` for dead code inventory

**Status:** This document is a living roadmap. Update after each phase completes.
