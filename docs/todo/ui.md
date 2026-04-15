# UI / Visual Todo

All visual, layout, typography, and feature issues reported for review and fixing.
Reference these items as `// see docs/todo/ui — #<ID>` in source code.

---

## Desktop

| # | Status | Item | Area | File(s) | Описание проблемы | Коммит | Проверено |
|---|--------|------|------|---------|-------------------|--------|-----------|
| U1 | ❌ | Logotype → match mockup design | Header / Camera overlay | `features/camera-overlay/` | Логотип не совпадает с макетом по форме/расположению | — | ❌ |
| U2 | ❌ | Logotype → make smaller | Header | `features/camera-overlay/` | Логотип визуально слишком крупный — нужна корректировка scale/размера | — | ❌ |
| U3 | ❌ | Info page — general desktop layout review | Info page | `features/info.component.ts` | Общий layout-паспорт desktop-версии страницы не проверен | — | ❌ |
| U4 | ✅ | Portfolio — inactive tab is white, needs styling | Portfolio tabs | `pages/portfolio-page.component.ts` | Неактивный таб отображался белым (цвет `mdc-tab__text-label` не задан для inactive) | — | ❌ |
| U5 | ✅ | Info h2 containers — align to left | Info page | `features/info.component.ts` | Заголовки секций были выровнены по центру, нужно по левому краю | — | ❌ |
| U6 | ❌ | Info — Star icon + spacing after it | Info page | `features/info.component.ts` | Символ `★` вплотную к тексту — нет отступа справа от иконки | — | ❌ |
| U7 | ✅ | Info — h5 + p spacing | Info page | `features/info.component.ts` | Между заголовком h5 и параграфом не было отступа (`margin-bottom` отсутствовал) | — | ❌ |
| U8 | ✅ | Contact form — fix spacing, align center | Contacts | `features/contacts-me.component.ts` | Поля формы были без `gap` — визуально слипались | — | ❌ |
| U9 | ❌ | Fonts — add Greenth Grunge + Montserrat/Manrope | Global styles | `src/styles/font.css` | Декоративный шрифт (заголовки) и читаемый (текст) не подключены | — | ❌ |
| U10 | ❌ | Portfolio — vertical video tab (9:16) | Portfolio | `pages/portfolio-page.component.ts`, `src/app/constants.ts` | Таб Vertical существует и данные есть — нужна визуальная проверка отображения | — | ❌ |
| U11 | ✅ | Portfolio — category label full width | Portfolio block | `features/portfolio-block/portfolio-block.component.css` | Подпись видео не растягивалась на всю ширину превью (`width` не был задан) | — | ❌ |
| U12 | ❌ | Optimization — background videos much lighter | Assets / PWA | `assets/`, `ngsw-config.json` | Фоновые `.webm` слишком тяжёлые — замедляют загрузку; нужен ffmpeg re-encode | — | ❌ |

---

## Mobile

| # | Status | Item | Area | File(s) | Описание проблемы | Коммит | Проверено |
|---|--------|------|------|---------|-------------------|--------|-----------|
| M1 | ❌ | Camera icon — more responsive sizing | Camera overlay | `features/camera-overlay/` | Иконка камеры фиксированного размера — не адаптируется к ширине экрана | — | ❌ |
| M2 | ❌ | Camera corners — smaller, thinner, tighter to edges | Camera corners layer | `features/camera-overlay/` | Уголки камеры `110px` — слишком большие; линии слишком толстые; должны быть ближе к краям экрана | — | ❌ |
| M3 | ❌ | Fonts — size based on page height (dvh), not width (vw) | Global styles | `src/styles/font.css`, `src/styles/core.css` | Размер шрифта в nav `calc(10px + 2vmin)` — привязан к ширине, а не высоте; на ландшафте слишком мелкий | — | ❌ |
| M4 | ✅ | Info page — disable parallax/hover effect on mobile | Info page | `features/info.component.ts` | На тач-экранах hover-трансформ `.regalia`/`.experience` не срабатывает корректно — нужен `@media (hover: none)` | — | ❌ |
| M5 | ❌ | Info container padding — match h5-to-p spacing | Info page mobile | `features/info.component.ts` | В мобильной версии `padding`/`gap` не согласованы между блоками | — | ❌ |
| M6 | ❌ | Logotype — centered in corners layer on mobile | Camera overlay | `features/camera-overlay/` | Логотип смещён в уголках на мобильном — абсолютное позиционирование не учитывает малые экраны | — | ❌ |
| M7 | ❌ | PRE-FETCH assets (fonts, icons, first-frame images) | PWA | `ngsw-config.json` | Критичные шрифты и иконки не попадают в `prefetch` — видны FOUT/сдвиги при загрузке | — | ❌ |
| M8 | ❌ | Burger menu — add hamburger nav for mobile | Header / Navigation | `features/camera-overlay/`, `app.component` | На мобиле нет мобильного меню — нужен бургер с анимацией открытия/закрытия | — | ❌ |
| M9 | ❌ | Footer — move into burger menu, vertical layout | Footer / Navigation | `features/camera-overlay/` | Footer должен отображаться внутри бургер-меню, колонкой (не строкой) | — | ❌ |

---

## Features — Portfolio

| # | Status | Item | File(s) | Описание проблемы | Коммит | Проверено |
|---|--------|------|---------|-------------------|--------|-----------|
| P1 | ❌ | Add vertical videos (9:16) to portfolio data | `src/app/constants.ts` | `CategoryEnum.Vertical` пуст — 8 записей уже добавлены в `2b44ae3`, нужна проверка что таб рендерит | `2b44ae3` | ❌ |
| P2 | ✅ | Portfolio titles — make larger | `features/portfolio-block/portfolio-block.component.css` | Подписи видео были `13px` — мелко, особенно в grid-3 | — | ❌ |

---

## Features — About Me (Info page)

| # | Status | Item | File(s) | Описание проблемы | Коммит | Проверено |
|---|--------|------|---------|-------------------|--------|-----------|
| A1 | ✅ | Add scrolling — page clips overflow | `pages/info-page.component.ts` | `:host` без `overflow-y` — контент обрезался при большом количестве записей | — | ❌ |
| A2 | ❌ | Add personal bio / self-description text | `features/info.component.ts` | Нет секции с личным описанием — только regalia/experience | — | ❌ |
| A3 | ❌ | Mobile — font too small, increase base size | `features/info.component.ts` | На мобиле `calc(8px + 1vw)` на узких экранах (~320px) даёт ~11px — нечитаемо | — | ❌ |
| A4 | ❌ | Text color — review yellowish tint | `src/styles/variables.css` | Возможен жёлтый оттенок текста из-за `brightness(120%)` на фоновом фильтре в `core.css` | — | ❌ |

---

## Features — Contact Me

| # | Status | Item | File(s) | Описание проблемы | Коммит | Проверено |
|---|--------|------|---------|-------------------|--------|-----------|
| CO1 | ❌ | Add Name field to form | `features/contacts-me.component.ts` | Форма не собирает имя отправителя | — | ❌ |
| CO2 | ❌ | Add Phone number field | `features/contacts-me.component.ts` | Нет поля для телефона | — | ❌ |
| CO3 | ❌ | Add cache / prevent duplicate submissions | `features/contacts-me.component.ts` | Повторная отправка возможна сразу после сброса формы — нет защиты от дублей | — | ❌ |
| CO4 | ❌ | Send button — hover effect + submit animation | `features/contacts-me.component.ts` | Кнопка Send без hover-стиля и без индикатора отправки (только текст меняется) | — | ❌ |

---

## Features — Legal

| # | Status | Item | File(s) | Описание проблемы | Коммит | Проверено |
|---|--------|------|---------|-------------------|--------|-----------|
| L1 | ❌ | Terms & Conditions — add cookies notice | New component or modal | Нет уведомления о cookies — требование GDPR для EU-аудитории | — | ❌ |

---

## Bugs — Navigation Blocked

| # | Status | Item | File(s) | Описание проблемы | Коммит | Проверено |
|---|--------|------|---------|-------------------|--------|-----------|
| S1 | ❌ | Something blocks the nav menu — z-index issue | `src/app/core/header.component.ts`, component CSS files | Все слои используют `z-index: 9999` — нет иерархии; на некоторых страницах оверлей перекрывает хедер | — | ❌ |
