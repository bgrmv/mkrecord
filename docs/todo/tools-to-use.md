# Tools to Introduce

Ordered by impact. Each entry includes install command, rationale, and immediate use cases.

---

## 1. @angular-eslint — Static Analysis

**Status:** No linting configured at all. No `.eslintrc`, no `eslint` in `package.json`.

```bash
pnpm add -D \
  eslint \
  @angular-eslint/builder \
  @angular-eslint/eslint-plugin \
  @angular-eslint/eslint-plugin-template \
  @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser \
  eslint-config-prettier
```

Add to `package.json`:
```json
"lint": "ng lint"
```

Add lint architect target to `angular.json` under `projects.mkrecord.architect`:
```json
"lint": {
  "builder": "@angular-eslint/builder:lint",
  "options": {
    "lintFilePatterns": ["src/**/*.ts", "src/**/*.html"]
  }
}
```

Key rules to enable immediately:
- `@angular-eslint/prefer-on-push-change-detection` — will catch all 15 missing `OnPush` cases
- `@angular-eslint/no-empty-lifecycle-method` — catches `ngAfterViewInit` with only unused vars
- `@typescript-eslint/no-unused-vars` — catches all dead fields in portfolio.component.ts
- `@angular-eslint/use-lifecycle-interface` — enforces `implements OnInit` declarations
- `@angular-eslint/no-input-rename` — prevents `@Input` aliasing bugs

---

## 2. Playwright — End-to-End Testing

**Status:** No e2e tests exist. Karma + Jasmine are configured for unit tests but no test scripts are defined.

```bash
pnpm add -D @playwright/test
pnpm exec playwright install --with-deps chromium
```

Add to `package.json`:
```json
"e2e": "playwright test",
"e2e:ui": "playwright test --ui"
```

Create `playwright.config.ts` at root with `baseURL: 'http://localhost:4000'` (SSR port).

Initial test targets (highest value for a portfolio site):
1. All four routes load without JS errors (`/`, `/portfolio`, `/info`, `/contacts`)
2. Portfolio tab switching renders video grid
3. Video dialog opens on portfolio item click
4. Contact form validation blocks submit with invalid email
5. SSR smoke test: verify server-rendered HTML contains `<app-root>` content before hydration

---

## 3. source-map-explorer — Bundle Analysis

**Status:** No bundle analysis configured. Cannot track size regressions.

```bash
pnpm add -D source-map-explorer
```

Add to `package.json`:
```json
"analyze": "ng build --configuration production --source-map && source-map-explorer dist/mkrecord/browser/**/*.js"
```

First run will likely reveal:
- `ngx-device-detector` — redundant with Angular CDK `BreakpointObserver` + `PlatformService`
- `@angular/youtube-player` — verify it's tree-shaken properly
- Material Design components not used (if any)

---

## 4. es-toolkit — Utility Functions

**Status:** Inline array/random utility code throughout services. `lodash` not installed; custom implementations have bugs (see `while(true)` in `background-service.ts`).

```bash
pnpm add es-toolkit
```

Immediate candidates:
- **`services/background-service.ts:12-26`** — replace `while(true)` exclusion loop with `sample()` / `shuffle()`:
  ```ts
  import { sample } from 'es-toolkit';
  // Replace getRandomVideoSrc() with:
  const pool = backgroundVideos.filter(v => v.preview !== currentSrc);
  return sample(pool)?.preview ?? backgroundVideos[0].preview;
  ```
- Any future array manipulation (shuffle, chunk, groupBy for portfolio categories)

---

## 5. TypeScript Strict Flags

**Status:** `tsconfig.json` has `strict: true` but is missing three additional flags that would catch the dead code documented in `deprecated.md`.

Add to `tsconfig.json` `compilerOptions`:
```json
"noUnusedLocals": true,
"noUnusedParameters": true,
"exactOptionalPropertyTypes": true
```

Expected compile errors after enabling (all are real bugs/dead code):
- `portfolio-timeline.component.ts` — `unsubscribe` Subject (unused local)
- `portfolio.component.ts` — `portfolioList`, `isCloseTo`, unused vars in `ngAfterViewInit`
- `home-brand.component.ts` — `timelineImageSignal` (unused local)
- `portfolio-page.component.ts` — `actualCategory` (unused local)
- `portfolio-block.component.ts` — `result` parameter in `afterClosed` callback
- `portfolio.component.ts` — `scrollWidth`, `scrolled` in `ngAfterViewInit`

Fix all errors, then keep the flags enabled permanently.

---

## 6. TypeScript Path Aliases

**Status:** All imports use relative paths (`../../services/…`, `../../../shared/…`). Long paths break when files are moved and reduce readability.

Add to `tsconfig.json` `compilerOptions`:
```json
"baseUrl": ".",
"paths": {
  "@app/*":      ["src/app/*"],
  "@core/*":     ["src/app/core/*"],
  "@features/*": ["src/app/features/*"],
  "@services/*": ["src/app/services/*"],
  "@pages/*":    ["src/app/pages/*"],
  "@shared/*":   ["src/app/shared/*"],
  "@env/*":      ["src/environments/*"]
}
```

Usage after:
```ts
import { PlatformService } from '@services/platform.service';
import { SafePipe } from '@shared/pipes/safe.pipe';
```

---

## 7. pnpm Scripts to Add

Current `package.json` `scripts` block is missing these:

```json
"lint":          "ng lint",
"test":          "ng test",
"test:coverage": "ng test --code-coverage",
"e2e":           "playwright test",
"analyze":       "ng build --configuration production --source-map && source-map-explorer dist/mkrecord/browser/**/*.js"
```

Without `"test"`, the CI step `npm run build:prod --if-present` silently skips testing.
