# Deprecated and Dead Code

Remove or implement all items below. Do not leave commented-out code in the codebase.

---

## `features/home-brand.component.ts`

**Line 2-3 — unused imports**
```ts
import { ParallaxItemDirective } from '../shared/directives/parrallax-item.directive';
import { PortfolioTimelineComponent } from './portfolio-timeline/portfolio-timeline.component';
```
Neither appears in the template (template only contains two `<img>` tags). Also an FSD violation — see `tech-debt.md#fsd-layer-violations`.
Action: remove both imports and their entries in `imports[]`.

**Line 55 — `timelineImageSignal` signal**
```ts
readonly timelineImageSignal = signal<string | null>(null);
```
Never read in template, never passed to another component, never mutated.
Action: delete.

---

## `features/portfolio/portfolio.component.ts`

**Line 12 — `PORTFOLIO_LIST` import + line 25 — unused field**
```ts
import { PORTFOLIO_LIST } from './constants';
readonly portfolioList = PORTFOLIO_LIST;
```
`portfolioList` is never referenced in the template.
Action: delete import and field.

**Line 27 — `VideoService` injection (service does not exist)**
```ts
#videoService = inject(VideoService);
```
`VideoService` is not defined anywhere in the codebase. This is a latent compile error.
Action: delete.

**Line 28 — constructor injection (should use `inject()`)**
```ts
constructor(public dialog: MatDialog) {}
```
All other components use `inject()`. See `tech-debt.md#change-detection`.
Action: `private readonly dialog = inject(MatDialog);` and remove the constructor.

**Lines 48-50 — empty `openDialog()` body**
```ts
openDialog(videoUrl: string): void {
  // this.#videoService.set(videoUrl);
}
```
Method body is fully commented out. Either implement or delete. Currently called from nothing.
Action: delete method (or implement with `inject(MatDialog).open(...)`).

**Line 30 — commented `#destroyRef`**
```ts
// #destroyRef = inject(DestroyRef);
```
Action: delete the comment line.

**Lines 94-98 — `isCloseTo()` method**
```ts
isCloseTo(number1: number, number2: number, tolerance = ITEM_WIDTH + 100) {
  console.log(number1, number2, Math.abs(number1 - number2) <= tolerance);
  return Math.abs(number1 - number2) <= tolerance;
}
```
Never called from template or any other method.
Action: delete.

---

## `features/portfolio-timeline/portfolio-timeline.component.ts`

**Line 41 — unused `Subject`**
```ts
private readonly unsubscribe = new Subject<void>();
```
`takeUntilDestroyed(this.destroyRef)` is already used instead. `unsubscribe` is never called.
Action: delete (including the `Subject` import from `rxjs` if it becomes unused).

---

## `entities/portfolio-block/video-dialog.component.ts`

**Lines 93-98 — dead `@if (data.url)` branch**
```html
@if (data.url) {
  <youtube-player videoId="rFGxVhX-cIo" … />
}
```
`data.url` is never set at the call site (`portfolio-block.component.ts:47-50` spreads `portfolio` which has no `url` field). This branch is unreachable. Additionally `videoId` is hardcoded to `"rFGxVhX-cIo"` — see `docs/todo/index.md` P0 #5.
Action: delete the `@if` branch entirely; keep only the `@else` block and promote it to the main template. Fix `[videoId]="data.videoId"` in the surviving block (it already does this correctly).

---

## `pages/portfolio-page.component.ts`

**Lines 144-146 — `actualCategory` signal**
```ts
public readonly actualCategory = signal<CategoryEnum>(CategoryEnum.Horizontal);
```
Never read in the template or passed anywhere.
Action: delete.

---

## `services/background-service.ts`

**Line 41 — commented dead code**
```ts
// map(() => false)
```
Uncommenting it would break the feature; it serves no documentation purpose.
Action: delete the comment line.

---

## `shared/directives/parrallax-item.directive.ts`

**Lines 13-17 — commented `@Input` properties**
```ts
// @Input() top;
// @Input() left;
// @Input() rotate = 30;
// @Input() opacity = 1;
// @Input() inversion = false;
```
Five inputs that were designed but never implemented. The template that would use them doesn't exist.
Action: delete all five comment lines.

**Lines 22-23, 29-33, 37-39 — commented implementation code**
```ts
// public newX;
// public newY;
// …
// this.eleRef.nativeElement.style.position = …
// this.elementDOMRect = …
```
Stale commented-out blocks from an incomplete refactor.
Action: delete all commented lines.

**Line 57 — commented `console.log`**
```ts
// console.log(screenX, screenY, cursorX, cursorY, transform);
```
Action: delete.

---

## `features/camera-overlay/camera-timer/camera-timer.component.ts`

**Line 31 — hardcoded past date as initial signal value**
```ts
protected readonly timerSignal = signal('2024-12-31T00:00:00.000Z');
```
The timer starts from midnight 2024-12-31 regardless of actual time — this is semantically meaningless.
Action: decide on real behavior (e.g., start from current time, show elapsed recording time) and implement.

**Line 36 — same hardcoded date used to drive the interval**
```ts
const date = new Date('2024-12-31T00:00:00.000Z');
```
Action: derive from `initialDate` constant (line 12) or use current time.

**Line 37 — `console.log(date)`**
Action: delete.

**Line 42 — commented implementation line**
```ts
// acc.setMilliseconds(acc.getMilliseconds() + 1);
```
Action: delete.

---

## `core/footer.component.ts`

**Lines 123-134 — commented-out "Developed by" credits block**
```html
<!-- <p>
  Developed by
  <span>
    <a href="#" target="_blank"> &#64;dpaniq </a>
    / …
  </span>
</p> -->
```
All links are `href="#"` dead links. If credits are desired, use real URLs.
Action: delete the entire commented block.

---

## `core/nav.component.ts`

**Line 81 — spurious `home` attribute**
```html
<a routerLink="/info" home routerLinkActive="active" …>
```
`home` is not a valid HTML attribute and has no Angular binding. It has no effect.
Action: delete the `home` attribute.

---

## `core/nav-mobile.component.ts`

**Line 90 — spurious `home` attribute**
```html
<a routerLink="/info" home routerLinkActive="active" …>
```
Same as `nav.component.ts` above.
Action: delete the `home` attribute.

---

## `shared/utils/fullscreen-api.ts`

**`fullScreenChange()` (line 27) — exported but never imported**
Searched the entire codebase: `fullScreenChange` is not imported anywhere. The event listeners that were wired to it are commented out (lines 6-7).
Action: delete `fullScreenChange()` and `pauseAndHideVideos()` (only called by `fullScreenChange`). If fullscreen functionality is needed, rewrite as an `@Injectable` class with SSR guard.

---

## Console.log Pollution

All `console.log` calls below must be removed before production. Debug logging belongs behind `isDevMode()` guards or a logger service.

| File | Line | Content |
|------|------|---------|
| `services/background-service.ts` | 20-23 | `'Selected background video:'` |
| `features/portfolio-timeline/portfolio-timeline.component.ts` | 35 | `index, portfolio, preview` |
| `features/portfolio/portfolio.component.ts` | 39 | `event.key` |
| `features/portfolio/portfolio.component.ts` | 72 | `{ scrolled, finalWidth }` |
| `features/portfolio/portfolio.component.ts` | 91 | `{ scrolled, finalWidth, lastIndex }` |
| `features/portfolio/portfolio.component.ts` | 96 | `number1, number2, …` |
| `features/portfolio-block/portfolio-block.component.ts` | 63 | `'The dialog was closed'` |
| `features/camera-overlay/camera-timer/camera-timer.component.ts` | 37 | `date` object |
| `shared/utils/fullscreen-api.ts` | 28 | `'HEY'` |
| `shared/utils/fullscreen-api.ts` | 29 | `event` |
| `shared/utils/fullscreen-api.ts` | 34 | `fullScreenElement, fullScreenEnable` |

Note: `app.config.ts:22` — `console.log('App initialized')` is inside `isDevMode()` guard — **keep it**.
