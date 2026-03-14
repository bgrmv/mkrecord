# 📊 Архитектура приложения mkrecord

## Обзор проекта

**mkrecord** - это портфолио приложение, построенное на Angular 20 со следующими возможностями:
- Портфолио с различными категориями (горизонтальные, вертикальные видео)
- Интерактивные компоненты камеры (таймер, батарея, качество)
- Адаптивный дизайн с мобильной навигацией
- Server-side rendering (SSR)
- Progressive Web App (PWA) поддержка

---

## 🏗️ Технологический стек

| Компонент | Версия | Описание |
|-----------|--------|---------|
| **Angular** | 20.3.10 | Основной фреймворк |
| **Angular Material** | 20.2.12 | UI компоненты |
| **Angular CDK** | 20.2.12 | Component Development Kit |
| **RxJS** | 7.8.2 | Реактивное программирование |
| **Express** | 5.1.0 | Сервер для SSR |
| **Angular SSR** | 20.3.9 | Server-side rendering |
| **Angular Service Worker** | 20.3.10 | PWA поддержка |

---

## 📁 Структура папок

```
src/app/
├── core/                      # Основные компоненты приложения
│   ├── empty.component.ts
│   ├── footer.component.ts
│   ├── header.component.ts
│   ├── nav.component.ts
│   ├── nav-mobile.component.ts
│   └── video-dialog.component.ts
│
├── features/                  # Переиспользуемые компоненты функций
│   ├── camera-battery/
│   ├── camera-corners-layer.component.ts
│   ├── camera-quality-resolution.component.ts
│   ├── camera-rec.component.ts
│   ├── camera-timer/
│   ├── contacts-me.component.ts
│   ├── home-brand.component.ts
│   ├── info.component.ts
│   ├── intro/
│   ├── portfolio/              # Компонент портфолио
│   ├── portfolio-block/
│   └── portfolio-timeline/
│
├── pages/                     # Страницы приложения (связаны с роутингом)
│   ├── contacts-page.component.ts
│   ├── home-page.component.ts
│   ├── info-page.component.ts
│   └── portfolio-page.component.ts
│
├── services/                  # Сервисы для логики приложения
│   ├── background-service.ts
│   ├── icon.service.ts
│   ├── platform.service.spec.ts
│   └── (другие сервисы)
│
├── shared/                    # Переиспользуемые утилиты, пайпы, директивы
│   ├── directives/
│   │   └── parrallax-item.directive.ts
│   ├── pipes/
│   │   ├── duration.pipe.ts
│   │   └── (другие пайпы)
│   └── utils/
│
├── app.component.ts           # Root компонент
├── app.component.html
├── app.component.css
├── app.config.ts              # Конфигурация приложения
├── app.config.server.ts       # Конфигурация для SSR
├── app.routes.ts              # Маршруты приложения
└── constants.ts               # Глобальные константы

src/
├── index.html
├── main.ts                    # Точка входа (браузер)
├── main.server.ts             # Точка входа (сервер)
├── manifest.webmanifest       # PWA манифест
└── styles/                    # Глобальные стили
```

---

## 🔀 Роутинг приложения

Настроено в [app.routes.ts](../src/app/app.routes.ts):

| Маршрут | Компонент | Описание |
|---------|-----------|---------|
| `/` | `HomePageComponent` | Главная страница |
| `/info` | `InfoPageComponent` | Страница информации |
| `/portfolio` | `PortfolioPageComponent` | Галерея портфолио |
| `/contacts` | `ContactsPageComponent` | Контакты |
| `**` | `EmptyComponent` | 404 страница |

---

## 🎯 Ключевые компоненты и их назначение

### App Component (Корневой компонент)

**Файл:** [app.component.ts](../src/app/app.component.ts)

**Назначение:** Точка входа приложения, управление макетом страницы

**Структура:**
```
┌─────────────────────────┐
│   HeaderComponent       │
├─────────────────────────┤
│   main (router-outlet)  │
│                         │
│  ┌─ HomePageComponent   │
│  ├─ InfoPageComponent   │
│  ├─ PortfolioPageComp.  │
│  └─ ContactsPageComp.   │
├─────────────────────────┤
│   FooterComponent       │
│   NavMobileComponent    │
│   CameraLayersOverlay   │
│   VideoBackground       │
└─────────────────────────┘
```

**Используемые компоненты:**
- `HeaderComponent` - навигация и логотип
- `FooterComponent` - подвал
- `NavMobileComponent` - мобильная навигация
- `CameraTimerComponent` - таймер в стиле камеры
- `CameraBatteryComponent` - индикатор батареи
- `CameraQualityResolutionComponent` - информация о качестве
- `CameraCornersLayerComponent` - визуальные углы камеры
- `YouTubePlayer` - встроенный YouTube плеер

---

## 🔧 Сервисы приложения

### BackgroundService

**Файл:** [background-service.ts](../src/app/services/background-service.ts)

**Назначение:** Управление фоновым видео, который меняется каждые 5 секунд в зависимости от страницы

**Ключевые сигналы:**
- `hasBackgroundVideos: Signal<boolean>` - показывает видео ли фон на текущей странице (не показывается на странице портфолио)
- `videoSrc: Signal<SafeResourceUrl>` - URL текущего видео

**Логика:**
```typescript
// Слушает события навигации
router.events.pipe(
  filter(event => event instanceof NavigationEnd),
  map(url => !url.includes('portfolio'))  // Видео везде кроме портфолио
)

// Меняет видео каждые 5 секунд
interval(5000).pipe(
  filter(() => this.hasBackgroundVideos()),
  map(() => getRandomVideoSrc(...))  // Случайное видео из портфолио
)
```

### IconService

**Файл:** [icon.service.ts](../src/app/services/icon.service.ts)

**Назначение:** Управление SVG иконками для приложения

### PlatformService

**Файл:** [platform.service.spec.ts](../src/app/services/platform.service.spec.ts)

**Назначение:** Определение платформы (браузер, сервер, мобильное устройство)

---

## 📦 Shared модули

### Pipes (Пайпы)

| Пайп | Назначение |
|------|-----------|
| `duration.pipe.ts` | Преобразование длительности видео в читаемый формат |
| Другие пайпы | Дополнительные преобразования данных |

### Directives (Директивы)

| Директива | Назначение |
|-----------|-----------|
| `parallax-item.directive.ts` | Эффект паралакса при скролле |

---

## 🎨 Стили и темизация

**Структура стилей:** `src/styles/`

```
styles/
├── core.css              # Основные стили
├── font.css              # Шрифты
├── keyframes.css         # Анимации
├── reset.css             # Сброс стилей браузера
├── transition-api.css    # Переходы между страницами
├── variables.css         # CSS переменные
├── view-transition.css   # Transitions для View API
└── theme/
    ├── _custom_palette.scss
    ├── _theme-colors.scss
    ├── custom-theme.scss
    └── m3-theme.scss     # Material Design 3 тема
```

---

## ⚙️ Конфигурация приложения

### app.config.ts (Браузер)

**Ключевые провайдеры:**

```typescript
- provideZonelessChangeDetection()      // Zoneless CD для лучшей производительности
- provideHttpClient(withFetch())        // HTTP клиент с Fetch API
- provideRouter(ROUTES, 
    withComponentInputBinding(),         // Привязка параметров маршрута
    withViewTransitions()                // Переходы между представлениями
  )
- provideClientHydration()              // Гидратация на клиенте после SSR
- provideServiceWorker('ngsw-worker.js') // PWA поддержка
```

### app.config.server.ts (Сервер)

**Конфигурация для server-side rendering**

---

## 🚀 Build и Deploy скрипты

**package.json:**

```json
{
  "start:dev": "ng serve --configuration development",
  "start:prod": "ng serve --configuration production",
  "build:dev": "ng build --configuration development",
  "build:prod": "ng build --configuration production",
  "watch": "ng build --watch --configuration development",
  "serve:dev:ssr:mkrecord": "cross-env NODE_ENV=development node dist/mkrecord/server/server.mjs",
  "serve:prod:ssr:mkrecord": "cross-env NODE_ENV=production node dist/mkrecord/server/server.mjs"
}
```

---

## 🏛️ Архитектурные паттерны

### 1. Standalone Components
Все компоненты используют standalone API вместо NgModules:
```typescript
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, ...],
  template: '...'
})
```

### 2. Zoneless Change Detection
Использует `provideZonelessChangeDetection()` для лучшей производительности:
- Автоматическое отслеживание изменений
- Меньше переотрисовок

### 3. Reactive Signals
Использование Angular Signals для реактивного состояния:
```typescript
public readonly videoSrc: Signal<SafeResourceUrl> = toSignal(...)
```

### 4. Dependency Injection
Все сервисы внедряются через Angular DI:
```typescript
private readonly router = inject(Router);
private readonly sanitizer = inject(DomSanitizer);
```

### 5. Router-based Navigation
URL управляет состоянием приложения:
- Бэк/форвард навигация
- Закладки сохраняют состояние
- SEO-friendly URL структура

### 6. Service Layer
Разделение бизнес-логики от компонентов:
- `BackgroundService` - управление фоном
- `IconService` - управление иконками
- `PlatformService` - определение платформы

---

## 🔄 Data Flow

```
┌─────────────────────────────────────────────┐
│         Router (Navigation)                 │
│  '/' → HomePageComponent                    │
│  '/portfolio' → PortfolioPageComponent      │
└────────────┬────────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────────┐
│         BackgroundService                   │
│  - Слушает NavigationEnd события            │
│  - Определяет нужен ли видео фон            │
│  - Меняет видео каждые 5 сек                │
└────────┬────────────────────────┬───────────┘
         │                        │
         ↓                        ↓
┌─────────────────┐      ┌──────────────────┐
│ hasBackgroundVideos    │      videoSrc    │
│ Signal<boolean>        │ Signal<SafeURL>  │
└────────┬────────┘      └────────┬─────────┘
         │                        │
         │                        ↓
         │              ┌──────────────────────┐
         │              │  <video> элемент    │
         │              │  на странице         │
         │              └──────────────────────┘
         │
         ↓
    ┌──────────────────────┐
    │   AppComponent       │
    │   @if (bgVideo)      │
    │     show video       │
    │   else               │
    │     hide video       │
    └──────────────────────┘
```

---

## 📊 Компонентная иерархия

```
AppComponent (root)
│
├── HeaderComponent
│   └── Navigation links
│
├── RouterOutlet (dinamically loads pages)
│   ├── HomePageComponent
│   ├── InfoPageComponent
│   ├── PortfolioPageComponent
│   │   └── PortfolioComponent
│   │       ├── PortfolioBlockComponent (repeat)
│   │       └── PortfolioTimelineComponent
│   └── ContactsPageComponent
│
├── FooterComponent
│
├── NavMobileComponent
│
├── CameraTimerComponent
├── CameraBatteryComponent
├── CameraQualityResolutionComponent
├── CameraCornersLayerComponent
│
├── Video Background
│   └── <video> element
│
└── YouTubePlayer (embedded)
```

---

## 🎯 Ключевые архитектурные решения

| Решение | Причина | Преимущества |
|---------|---------|-------------|
| **Standalone Components** | Современный подход Angular | Простота, меньше boilerplate |
| **Zoneless CD** | Производительность | Меньше detectChanges вызовов |
| **Signals** | Reactive state | Type-safe, efficient |
| **SSR** | SEO оптимизация | Лучше для поисковых систем |
| **PWA** | Offline support | Работает без интернета |
| **Router-based state** | Single source of truth | Сохранение состояния в URL |

---

## 💡 Рекомендации по улучшению

### 1. Группировка Camera компонентов
Текущее состояние: Camera-компоненты как отдельные компоненты
```
camera-corners-layer
camera-quality-resolution
camera-rec
camera-timer
camera-battery
```

**Рекомендация:** Объединить в один `CameraOverlayComponent`
```
CameraOverlayComponent
├── Corners layer
├── Quality/Resolution
├── Timer
├── Battery
└── Recording indicator
```

### 2. Типизация Portfolio данных
Убедиться, что все типы для портфолио определены в `types.d.ts`

### 3. Оптимизация BackgroundService
- Рассмотреть использование `switchMap` для отмены предыдущих подписок
- Добавить cleanup при destroy

### 4. Кеширование видео
Предзагрузка следующего видео перед переключением

### 5. Тестирование
- Unit тесты для сервисов (особенно BackgroundService)
- E2E тесты для роутинга и навигации

---

## 🔗 Связанные файлы

- [Angular Documentation](https://angular.io)
- [Angular Material](https://material.angular.io)
- [RxJS Documentation](https://rxjs.dev)
- [Express Documentation](https://expressjs.com)

---

**Дата создания документа:** March 14, 2026
