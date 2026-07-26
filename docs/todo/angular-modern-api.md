# Angular Modern API — Migration Audit

Where to replace legacy/suboptimal patterns with modern Angular APIs.
Each item includes **why** — so every code change teaches you the reasoning behind it.

---

## ✅ Already Well-Implemented

**No action needed — use as reference patterns:**

| API | Used in | Example | Status |
|-----|---------|---------|--------|
| `signal()` | All components | CameraBatteryComponent, ContactsMe | ✅ Excellent |
| `toSignal()` | BackgroundService, PlatformService | Observable → Signal conversion | ✅ Excellent |
| `computed()` | VideoDialogComponent, PortfolioTimeline | Derived state | ✅ Excellent |
| `linkedSignal()` | portfolio-page.component.ts:157 | Responsive grid view | ✅ Canonical example |
| `input()` / `input.required()` | All components | portfolio-block.component.ts | ✅ Perfect |
| `viewChild()` / `viewChildren()` | portfolio-block.component.ts | Template queries | ✅ Good |
| `@if` / `@for` / `@switch/@case` | All templates | New control flow syntax | ✅ 100% adoption |
| `ChangeDetectionStrategy.OnPush` | ~60% of components | See tech-debt.md P1 #10 | ⚠️ Incomplete |
| `inject()` for DI | All services/components | Standard pattern | ✅ Perfect |
| `takeUntilDestroyed()` | Observable cleanup | RxJS unsubscription | ✅ Good |

---

## 🔄 Needs Migration

Below are patterns to modernize. Each shows **what** to use, **why**, and a before/after example.

---

## A. `toSignal()` → eliminate `async` pipe

| # | File:line | Current | Recommended | Why |
|---|-----------|---------|-------------|-----|
| A1 | `features/camera-overlay/camera-quality-resolution.component.ts:27,30-33` | `quality$ \| async` in template + raw observable field | `toSignal()` + `{{ quality() }}` | **Use `toSignal()` because** the `async` pipe creates a subscription and adds `CommonModule` dependency; `toSignal()` converts the observable to a signal once, works natively with zoneless change detection, and removes the need for `CommonModule` import. |

### A1 — Before / After

```ts
// BEFORE (camera-quality-resolution.component.ts)
import { CommonModule } from '@angular/common';
// template: `<p>{{ quality$ | async }}</p>`
protected quality$ = interval(3000).pipe(
  startWith(randomChoice(cameraQualities)),
  map(() => randomChoice(cameraQualities)),
);

// AFTER
import { toSignal } from '@angular/core/rxjs-interop';
// template: `<p>{{ quality() }}</p>`
protected quality = toSignal(
  interval(3000).pipe(
    startWith(randomChoice(cameraQualities)),
    map(() => randomChoice(cameraQualities)),
  ),
  { initialValue: randomChoice(cameraQualities) }
);
// Remove CommonModule from imports — no longer needed.
```

---

## B. `ngAfterViewInit` / `ngOnDestroy` → `afterNextRender()` + `DestroyRef`

| # | File:line | Current | Recommended | Why |
|---|-----------|---------|-------------|-----|
| B1 | `features/portfolio-block/portfolio-block.component.ts:47-70` | `ngAfterViewInit()` + `ngOnDestroy()` | `afterNextRender()` + `DestroyRef.onDestroy()` | **Use `afterNextRender()` because** it runs only in the browser (SSR-safe by design), replaces both the lifecycle hook and the manual `isBrowser` guard. `DestroyRef.onDestroy()` replaces `ngOnDestroy` — it's composable, injectable, and works with `takeUntilDestroyed()` consistently. |
| B2 | `shared/directives/parrallax-item.directive.ts:14,19-23` | `ngOnInit()` sets DOM styles | Constructor or `afterNextRender()` | **Use `afterNextRender()` because** setting DOM styles requires the element to be rendered. `ngOnInit` runs on the server too, where DOM manipulation is wasteful. `afterNextRender()` is SSR-safe and semantically correct for DOM work. |
| B3 | `app.component.ts:44,73-77` | `ngOnInit()` with `isBrowser` guard | `afterNextRender()` | **Use `afterNextRender()` because** the entire `ngOnInit` body is guarded by `isBrowser` — `afterNextRender()` does this automatically, making the guard redundant and the intent clearer. |

### B1 — Before / After

```ts
// BEFORE (portfolio-block.component.ts)
export class PortfolioBlockComponent implements OnDestroy, AfterViewInit {
  private observer: IntersectionObserver | null = null;

  ngAfterViewInit() {
    this.videos().forEach(v => v.nativeElement.playbackRate = 0.5);
    if (this.platformService.isBrowser) {
      this.observer = new IntersectionObserver(…);
      this.videos().forEach(v => this.observer!.observe(v.nativeElement));
    }
  }
  ngOnDestroy() { this.observer?.disconnect(); }
}

// AFTER
export class PortfolioBlockComponent {
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      this.videos().forEach(v => v.nativeElement.playbackRate = 0.5);
      const observer = new IntersectionObserver(…);
      this.videos().forEach(v => observer.observe(v.nativeElement));
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
// No isBrowser guard needed — afterNextRender() only runs in the browser.
// No implements OnDestroy/AfterViewInit — lifecycle interfaces become unnecessary.
```

### B2 — Before / After

```ts
// BEFORE (parrallax-item.directive.ts)
export class ParallaxItemDirective implements OnInit {
  ngOnInit(): void {
    this.eleRef.nativeElement.style.transform = `translate(0px, 0px)`;
    this.eleRef.nativeElement.style.transition = 'transform 0.2s allow-discrete';
  }
}

// AFTER
export class ParallaxItemDirective {
  constructor() {
    afterNextRender(() => {
      this.eleRef.nativeElement.style.transform = `translate(0px, 0px)`;
      this.eleRef.nativeElement.style.transition = 'transform 0.2s allow-discrete';
    });
  }
}
// SSR-safe: DOM manipulation only happens in the browser.
```

---

## C. `ngOnInit` subscriptions → constructor + `takeUntilDestroyed()`

| # | File:line | Current | Recommended | Why |
|---|-----------|---------|-------------|-----|
| C1 | `features/camera-overlay/camera-battery/camera-battery.component.ts:49,57-71` | `ngOnInit()` with `isBrowser` guard + `interval().subscribe()` | `afterNextRender()` or constructor with `takeUntilDestroyed()` | **Use constructor because** `takeUntilDestroyed()` without explicit `DestroyRef` only works in injection context (constructor). Moving the subscription to the constructor removes the need for manual `DestroyRef` injection and `OnInit`. Guard with `afterNextRender()` for the browser-only part. |
| C2 | `features/camera-overlay/camera-timer/camera-timer.component.ts:28,34-54` | Same pattern as C1 | Same recommendation | Same reasoning — interval subscription belongs in constructor or `afterNextRender()`. |
| C3 | `features/portfolio-timeline/portfolio-timeline.component.ts:26,43-57` | Same pattern as C1 | Same recommendation | Same reasoning. Additionally, C4 violation — the interval should move to a service (see tech-debt.md). |

### C1 — Before / After

```ts
// BEFORE (camera-battery.component.ts)
export class CameraBatteryComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformService = inject(PlatformService);

  ngOnInit() {
    if (this.platformService.isBrowser) {
      interval(1500).pipe(
        map(timer => timer % 2 === 0),
        takeUntilDestroyed(this.destroyRef),
      ).subscribe(…);
    }
  }
}

// AFTER
export class CameraBatteryComponent {
  constructor() {
    afterNextRender(() => {
      interval(1500).pipe(
        map(timer => timer % 2 === 0),
        takeUntilDestroyed(),  // no DestroyRef needed — injection context
      ).subscribe(…);
    });
  }
}
// Removes: OnInit interface, DestroyRef injection, PlatformService isBrowser guard.
// Note: takeUntilDestroyed() without args works only in injection context (constructor).
// afterNextRender() callback runs in injection context when called from constructor.
```

---

## D. `@HostListener` → `host` metadata property

| # | File:line | Current | Recommended | Why |
|---|-----------|---------|-------------|-----|
| D1 | `features/portfolio/portfolio.component.ts:35` | `@HostListener('document:keydown', ['$event'])` | `host: { '(document:keydown)': 'setScroll($event)' }` in `@Component` | **Use `host` property because** it centralizes all host bindings in the component metadata, making them visible at a glance. `@HostListener` is a decorator that scatters host behavior across the class body. Angular team recommends `host` property for new code. |
| D2 | `shared/directives/parrallax-item.directive.ts:25` | `@HostListener('document:mousemove', ['$event'])` | `host: { '(document:mousemove)': 'onMouseMove($event)' }` in `@Directive` | Same reasoning as D1. |

### D1 — Before / After

```ts
// BEFORE (portfolio.component.ts)
@HostListener('document:keydown', ['$event'])
setScroll(event: KeyboardEvent) { … }

// AFTER — in @Component decorator:
@Component({
  host: { '(document:keydown)': 'setScroll($event)' },
  …
})
// Remove @HostListener import.
// host property keeps all host interactions in one place — easier to audit.
```

---

## E. `subscribe()` in components → `toSignal()` (where state is read, not side-effected)

| # | File:line | Current | Recommended | Why |
|---|-----------|---------|-------------|-----|
| E1 | `features/camera-overlay/camera-battery/camera-battery.component.ts:65-69` | `subscribe()` sets signal | `toSignal()` + `computed()` | **Use `toSignal()` + `computed()` because** the subscription only maps an observable value into a signal — this is exactly what `toSignal()` does declaratively. `computed()` derives the icon from the timer value without imperative mutation. |
| E2 | `features/camera-overlay/camera-timer/camera-timer.component.ts:50-52` | `subscribe()` sets signal | `toSignal()` | **Use `toSignal()` because** the subscription only forwards values from observable to signal — `toSignal()` removes the imperative glue code entirely. |

### E1 — Before / After

```ts
// BEFORE (camera-battery.component.ts)
protected readonly batterySignal = signal<boolean>(true);
protected readonly batteryIcon = signal<string>(batteryIcons.at(3)!);

interval(1500).pipe(map(t => t % 2 === 0), …)
  .subscribe(timer => {
    this.batterySignal.update(() => timer);
    this.batteryIcon.set(batteryIcons.at(timer ? 2 : 3)!);
  });

// AFTER
protected readonly batteryTick = toSignal(
  interval(1500).pipe(map(t => t % 2 === 0)),
  { initialValue: true }
);
protected readonly batteryIcon = computed(() =>
  batteryIcons.at(this.batteryTick() ? 2 : 3)!
);
// No subscribe(), no manual signal mutation.
// computed() is declarative: the icon is DERIVED from the tick — not SET by a callback.
```

---

## F. `linkedSignal()` — already used correctly

| # | File:line | Status |
|---|-----------|--------|
| F1 | `pages/portfolio-page.component.ts:157-159` | `linkedSignal()` — correct usage. Reacts to `isMobile()` changes. |

No action needed. Reference this as the canonical example for `linkedSignal()` in the codebase.

---

## G. `computed()` — already used correctly

| # | File:line | Status |
|---|-----------|--------|
| G1 | `features/portfolio-timeline/portfolio-timeline.component.ts:31-37` | `computed()` derives `timelineImage` from `activePreview` — correct. |
| G2 | `entities/portfolio-block/video-dialog.component.ts:130` | `computed()` — correct. |

---

## H. Reactive Forms → Signal-based Forms (future)

| # | File:line | Current | Recommended | Why |
|---|-----------|---------|-------------|-----|
| H1 | `features/contacts-me.component.ts:195-202` | `FormGroup` + `FormControl` (reactive forms) | Signal-based forms (when stable) | **Wait for Angular signal-based forms** to stabilize (currently experimental). The current `ReactiveFormsModule` approach is correct and production-ready. When the signal-based forms API becomes stable, migrate — it integrates natively with the signal graph, eliminating the impedance mismatch between `FormControl.valueChanges` (observable) and signals. **Do not migrate yet.** |

---

## I. `effect()` + `untracked()` — commented-out but correct pattern

| # | File:line | Status |
|---|-----------|--------|
| I1 | `app.component.ts:59-70` | Commented-out `effect()` with `untracked()` — the pattern is correct. When uncommented, `effect()` reacts to `backgroundVideoSrc()` changes and `untracked()` prevents tracking `_video()` to avoid circular re-triggers. |

**Use `effect()` because** it's designed for side effects that must run when a signal changes (e.g., calling `video.play()`). Unlike `computed()`, it doesn't return a value — it performs an action. `untracked()` inside `effect()` reads signals without subscribing to them, preventing unwanted re-runs.

---

## J. `interval()` owned by components → move to services + use `toSignal()`

| # | File:line | Current | Recommended | Why |
|---|-----------|---------|-------------|-----|
| J1 | `features/camera-overlay/camera-battery/camera-battery.component.ts:60` | `interval(1500)` in component | Move to `CameraStateService` | **Move to a service because** CQRS requires components to be pure view — they read query signals, they don't own timers. The service exposes `batteryTick` and `batteryIcon` as read-only signals; the component just binds `{{ service.batteryIcon() }}`. |
| J2 | `features/camera-overlay/camera-timer/camera-timer.component.ts:40` | `interval(1000)` in component | Move to `CameraStateService` | Same reasoning — timer state is application state, not UI state. |
| J3 | `features/portfolio-timeline/portfolio-timeline.component.ts:46` | `interval(5000)` in component | Move to `PortfolioTimelineService` | Same reasoning — portfolio rotation is business logic. |

These overlap with CQRS violations C1, C2, C4 in [tech-debt.md](tech-debt.md). The modern API migration (this doc) and CQRS fix (tech-debt.md) should happen together.

---

## K. Mutable class fields → signals

| # | File:line | Current | Recommended | Why |
|---|-----------|---------|-------------|-----|
| K1 | `features/portfolio/portfolio.component.ts:32-33` | `disabledLeft = true; disabledRight = false;` (plain mutable fields) | `disabledLeft = signal(true); disabledRight = signal(false);` | **Use `signal()` because** with zoneless change detection, plain mutable fields don't trigger view updates. Signals notify the change detection system when their value changes. Without signals, template bindings to `disabledLeft` / `disabledRight` may not update. |

---

## Summary — Migration Priority

| Priority | Items | Impact |
|----------|-------|--------|
| **High** | A1 (async→toSignal), B1-B3 (lifecycle→afterNextRender), K1 (fields→signals) | SSR safety, zoneless correctness |
| **Medium** | C1-C3 (ngOnInit→constructor), D1-D2 (HostListener→host), E1-E2 (subscribe→toSignal+computed) | Code clarity, fewer imperative patterns |
| **Low** | H1 (signal forms — wait), I1 (uncomment effect) | Future API, blocked on Angular stability |

---

## How to read code comments

Every annotated line in source code follows this format:

```ts
// see docs/todo/angular-modern-api.md — #ID: use <API> because <reason>
```

Example:
```ts
// see docs/todo/angular-modern-api.md — A1: use toSignal() because async pipe adds unnecessary CommonModule dependency and doesn't integrate with zoneless change detection
```

This pattern teaches you **what** to use and **why** — so each fix is a learning moment, not just a chore.
