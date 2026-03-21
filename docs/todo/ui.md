# UI / Visual Todo

All visual, layout, typography, and feature issues reported for review and fixing.
Reference these items as `// see docs/todo/ui — #<ID>` in source code.

---

## Desktop

| # | Status | Item | Area | File(s) | Notes |
|---|--------|------|------|---------|-------|
| U1 | [ ] | Logotype → match mockup design | Header / Camera overlay | `features/camera-overlay/` | Visual alignment to design reference |
| U2 | [ ] | Logotype → make smaller | Header | `features/camera-overlay/` | Size/scale adjustment |
| U3 | [ ] | Info page — general desktop layout review | Info page | `features/info.component.ts` | Layout pass |
| U4 | [ ] | Portfolio — inactive tab is white, needs styling | Portfolio tabs | `pages/portfolio-page.component.ts` | Fix `::ng-deep` Material tab label color |
| U5 | [ ] | Info h1 container — align to left | Info page | `features/info.component.ts` | CSS `text-align` / `margin` |
| U6 | [ ] | Info — Star icon + spacing after it | Info page | `features/info.component.ts` | Add `gap` or `margin-right` |
| U7 | [ ] | Info — h5 + p spacing | Info page | `features/info.component.ts` | `margin-bottom` on h5 or `margin-top` on p |
| U8 | [ ] | Contact form — fix spacing, align center | Contacts | `features/contacts-me.component.ts` | Padding / flexbox gap |
| U9 | [ ] | Fonts — add Greenth Grunge + Montserrat/Manrope | Global styles | `src/styles/font.css` | `@font-face` or Google Fonts import |
| U10 | [ ] | Portfolio — vertical video tab (9:16) | Portfolio | `pages/portfolio-page.component.ts`, `src/app/constants.ts` | `CategoryEnum.Vertical` exists; add video entries + verify tab |
| U11 | [ ] | Portfolio — category label full width | Portfolio block | `features/portfolio-block/portfolio-block.component.css` | Title overlay `width: 100%` |
| U12 | [ ] | Optimization — background videos much lighter | Assets / PWA | `assets/`, `ngsw-config.json` | Compress/re-encode `.webm` files; reduce resolution/bitrate |

---

## Mobile

| # | Status | Item | Area | File(s) | Notes |
|---|--------|------|------|---------|-------|
| M1 | [ ] | Camera icon — more responsive sizing | Camera overlay | `features/camera-overlay/` | Use `vw`/`clamp()` units |
| M2 | [ ] | Camera corners — smaller on mobile | Camera corners layer | `features/camera-overlay/` | Media query or `clamp()` |
| M3 | [ ] | Fonts — size based on page height (dvh), not width (vw) | Global styles | `src/styles/font.css`, `src/styles/core.css` | Replace `calc(10px + 2vmin)` with `clamp()` using `dvh` |
| M4 | [ ] | Info page — disable parallax/hover effect on mobile | Info page | `features/info.component.ts` | `@media (hover: none)` or max-width query to remove transform |
| M5 | [ ] | Info container padding — match h5-to-p spacing | Info page mobile | `features/info.component.ts` | Consistent `padding`/`gap` values in mobile breakpoint |
| M6 | [ ] | Logotype — centered in corners layer on mobile | Camera overlay | `features/camera-overlay/` | Fix absolute positioning |
| M7 | [ ] | PRE-FETCH assets (fonts, icons, first-frame images) | PWA | `ngsw-config.json` | Add critical fonts + icons to `prefetch` asset group |

---

## Features — Portfolio

| # | Status | Item | File(s) | Notes |
|---|--------|------|---------|-------|
| P1 | [ ] | Add vertical videos (9:16) to portfolio data | `src/app/constants.ts` | New entries under `CategoryEnum.Vertical` |
| P2 | [ ] | Portfolio titles — make larger | `features/portfolio-block/portfolio-block.component.css` | Increase `font-size` on title overlay |

---

## Features — About Me (Info page)

| # | Status | Item | File(s) | Notes |
|---|--------|------|---------|-------|
| A1 | [ ] | Add scrolling — page clips overflow | `pages/info-page.component.ts`, `features/info.component.ts` | Set `overflow-y: auto` on container |
| A2 | [ ] | Add personal bio / self-description text | `features/info.component.ts` | Edit hardcoded `regalias` / `experiences` arrays or add new section |
| A3 | [ ] | Mobile — font too small, increase base size | `features/info.component.ts` | Media query min font-size for mobile |
| A4 | [ ] | Text color — review yellowish tint | `src/styles/variables.css` | Adjust `--text1` / `--c_white` if tinted |

---

## Features — Contact Me

| # | Status | Item | File(s) | Notes |
|---|--------|------|---------|-------|
| CO1 | [ ] | Add Name field to form | `features/contacts-me.component.ts` | New `FormControl('', Validators.required)` |
| CO2 | [ ] | Add Phone number field | `features/contacts-me.component.ts` | New `FormControl` with optional phone validator |
| CO3 | [ ] | Add cache / prevent duplicate submissions | `features/contacts-me.component.ts` | `localStorage` flag or debounce after success |
| CO4 | [ ] | Send button — hover effect + submit animation | `features/contacts-me.component.ts` | CSS transitions + loading spinner or class toggle on submit |

---

## Features — Legal

| # | Status | Item | File(s) | Notes |
|---|--------|------|---------|-------|
| L1 | [ ] | Terms & Conditions — add cookies notice | New component or modal | New page route or bottom-bar cookie banner |

---

## Bugs — Navigation Blocked

| # | Status | Item | File(s) | Notes |
|---|--------|------|---------|-------|
| S1 | [ ] | Something blocks the nav menu — z-index issue | `src/app/core/header.component.ts`, component CSS files | `header` has `z-index: 9999` but may be overridden; audit stacking contexts across pages |
