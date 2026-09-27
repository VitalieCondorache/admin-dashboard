# Admin Dashboard — Onboarding Guide

This document walks through the **Admin Dashboard** frontend: what it does, how it is built, what each folder/file is responsible for, and how to run, test, and extend it. It is written so a developer who is **new to Angular** can ramp up quickly — the core concepts are explained inline.

---

## 1. What is this application?

Admin Dashboard is a **single-page administration panel** (SPA) written in Angular. It is a demo portfolio project that simulates a real admin panel: authentication, managing users, products, orders, viewing analytics, and personal settings. There is **no real backend** — all API calls are intercepted and answered from an in-memory mock (see [src/app/core/mock/mock-api.interceptor.ts](../src/app/core/mock/mock-api.interceptor.ts)). This makes the app self-contained: `npm start` and everything works.

### Main features
- **Login page** with email/password, demo credentials `admin@demo.com / admin123`.
- **Sidebar + topbar layout** that stays the same across all pages, with a collapsible sidebar.
- **Dashboard** with KPI cards, a revenue line chart, users-by-role doughnut, and a recent-orders table.
- **Users** CRUD (create/read/update/delete) with pagination, sorting, searching, and confirm-delete dialog.
- **Products** grid with filters (category, status), pagination.
- **Orders** table with summary cards, filters, pagination.
- **Analytics** page with multiple charts (line, doughnut, bar) and a top-countries list.
- **Settings** with 4 tabs: profile, security, notifications, appearance (theme switcher).
- **Dark/Light mode** toggle.
- **Internationalization** (i18n): English and Romanian, switchable from the topbar.
- **Route guards** that redirect unauthenticated users to `/auth/login` and signed-in users away from `/auth/login`.

---

## 2. Tech stack (what the package.json tells us)

Key libraries from [package.json](../package.json):

| Library | Role |
|---|---|
| `@angular/core` 21 | Angular framework (standalone components, signals). |
| `@angular/material` 21 | UI component library (buttons, tables, dialogs, form fields, menus). |
| `@angular/cdk` | Low-level primitives used by Material. |
| `@angular/router` | Client-side routing (which component shows for which URL). |
| `@angular/forms` | Reactive forms (`FormGroup`, `FormControl`, validators). |
| `@jsverse/transloco` | Translations (i18n). Runtime language switching. |
| `@ngrx/signals` | Signal-based state management used for `UsersStore`. |
| `chart.js` + `ng2-charts` | Charts (line, doughnut, bar). |
| `tailwindcss` | Utility-first CSS classes (`flex`, `gap-4`, `text-sm`, …). |
| `rxjs` | Reactive streams — used for HTTP, form value changes, etc. |
| `vitest` + `@vitest/coverage-v8` | Unit test runner and coverage. |

---

## 3. Angular concepts you must know first

If you come from React/Vue or from older Angular, read this short list — the rest of the doc assumes it.

### 3.1 Standalone components
Every component in this project is **standalone** (`standalone: true` in the `@Component` decorator). That means:
- No `NgModule` is needed.
- The component declares its own `imports: [...]` — every directive, pipe, or other component it uses in the template must be listed there.
- Example: [dashboard-home.component.ts](../src/app/features/dashboard/dashboard-home.component.ts) imports `CommonModule`, `MatIconModule`, `TranslocoModule`, etc.

### 3.2 Signals
Signals are Angular’s built-in reactive state primitive (introduced in v16+, stable in v17+). In this project we use them heavily.

```ts
readonly count = signal(0);              // writable
readonly double = computed(() => this.count() * 2); // derived
this.count.set(5);                        // update
this.count.update(v => v + 1);            // update from old value
```

In templates, call them like a function: `{{ count() }}`.

`toSignal(observable$)` turns an RxJS `Observable` into a signal — we use it to consume HTTP responses directly:
```ts
readonly stats = toSignal(this.http.get<DashboardStats>('/api/dashboard/stats'), {
  initialValue: null,
});
```

### 3.3 Dependency injection with `inject()`
Instead of constructor params, we use the `inject()` function:
```ts
private readonly http = inject(HttpClient);
private readonly router = inject(Router);
```

Less boilerplate, works anywhere in the injection context.

### 3.4 Reactive forms
```ts
readonly form = this.fb.nonNullable.group({
  email: ['', [Validators.required, Validators.email]],
  password: ['', [Validators.required, Validators.minLength(6)]],
});
```
Bound in the template with `[formGroup]` and `formControlName`. We read state with `form.valid`, `form.controls.email.hasError('email')`, etc.

### 3.5 New control flow syntax `@if / @for`
Angular 17+ replaces `*ngIf`/`*ngFor` with built-in blocks:
```html
@if (loading()) {
  <mat-progress-bar mode="indeterminate" />
}
@for (item of items(); track item.id) {
  <li>{{ item.name }}</li>
}
```

### 3.6 HTTP interceptors
Functions that can read/modify every HTTP request and response. Registered in [app.config.ts](../src/app/app.config.ts) via `withInterceptors([...])`. We have three, and **order matters** — they run in registration order on the way *out*, and in reverse on the way *back in*:
1. `authInterceptor` — attaches `Authorization: Bearer <token>` to outgoing requests.
2. `errorInterceptor` — wraps everything registered after it, so it also catches failures coming from the mock layer.
3. `mockApiInterceptor` — the fake "backend". It is registered **last** so it sits at the end of the chain and answers the request there, like a real server would.

The net effect is that the real cross-cutting concerns (auth, error handling) sit *on top of* the fake backend instead of underneath it, so a `401` returned by the mock is handled exactly like a real one.

### 3.7 Router guards
Functions returning `boolean | UrlTree`. If they return `false` or a `UrlTree`, navigation is blocked/redirected.

---

## 4. Project structure, folder by folder

```
admin-dashboard/
├── angular.json              # Angular CLI config (build, serve, test targets)
├── package.json              # npm scripts and dependencies
├── tsconfig*.json            # TypeScript compiler settings
├── tailwind.config.js        # Tailwind theme (brand colors, darkMode: 'class')
├── postcss.config.js         # Tailwind/Autoprefixer via PostCSS
├── public/assets/i18n/       # en.json, ro.json — translations served as static files
├── src/
│   ├── index.html            # HTML shell
│   ├── main.ts               # bootstrap entry point
│   ├── styles.scss           # global styles + Tailwind directives
│   ├── testing/              # test helpers shared between specs
│   └── app/
│       ├── app.ts            # Root component (`<app-root>`)
│       ├── app.routes.ts     # URL -> component mapping
│       ├── app.config.ts     # Providers (router, http, animations, charts, i18n)
│       ├── core/             # Cross-cutting services, guards, interceptors, models
│       ├── features/         # Page-level components (auth, dashboard, users, …)
│       ├── layouts/          # Shared page shells (dashboard-layout with sidebar+topbar)
│       └── shared/           # Reusable UI bits (dialogs, placeholder)
└── docs/
    └── ONBOARDING.md         # This file
```

---

## 5. Bootstrap & configuration files

### [src/main.ts](../src/main.ts)
Starts the application with `bootstrapApplication(App, appConfig)`. This is the Angular equivalent of `ReactDOM.createRoot(...)`.

### [src/app/app.ts](../src/app/app.ts)
Root standalone component. Its template is just `<router-outlet />` — the router decides what to show based on the URL.

### [src/app/app.config.ts](../src/app/app.config.ts)
Central place that wires up all application-wide providers:
- `provideRouter(routes, withComponentInputBinding(), withViewTransitions())` — enables routing. `withComponentInputBinding()` maps route params to `@Input()` automatically. `withViewTransitions()` enables the View Transitions API for smoother page changes.
- `provideHttpClient(withInterceptors([authInterceptor, errorInterceptor, mockApiInterceptor]))` — enables `HttpClient` with the three interceptors. `mockApiInterceptor` is deliberately **last**: it plays the role of the remote server at the end of the chain, so the auth and error layers wrap it exactly as they would wrap a real backend.
- `provideAnimationsAsync()` — lazy-loads Angular animations (needed by Material).
- `provideCharts(withDefaultRegisterables())` — registers all chart.js types.
- `provideTransloco({...})` — configures translations (available languages `en`/`ro`, default `en`, custom HTTP loader).

### [src/app/app.routes.ts](../src/app/app.routes.ts)
Defines the URL structure. Every feature is **lazy-loaded** via `loadComponent`, which means its JS bundle is downloaded only when the user navigates to it — faster initial load.

```
/auth/login                   → LoginComponent      (guestGuard)
/                             → DashboardLayoutComponent  (authGuard)
  ├── dashboard              → DashboardHomeComponent
  ├── users                  → UsersComponent
  ├── products               → ProductsComponent
  ├── orders                 → OrdersComponent
  ├── analytics              → AnalyticsComponent
  └── settings               → SettingsComponent
**  (anything else)           → redirect to /
```

---

## 6. Core folder — the plumbing

Everything that is not a page but is used across the app.

### 6.1 `core/auth/`
- **[auth.service.ts](../src/app/core/auth/auth.service.ts)** — `AuthService` keeps the session (`user` + `tokens`) in a single `signal`, restores it from `localStorage` on construction, and persists it on login. Public API: `login(payload)`, `logout()`, `hasRole(...roles)`, plus the computed signals `user`, `isAuthenticated`, `accessToken` and `role`. This is the single source of truth for "is the user logged in?".
- **[auth.guards.ts](../src/app/core/auth/auth.guards.ts)** — three functional guards:
  - `authGuard`: blocks access when not logged in, redirects to `/auth/login`.
  - `guestGuard`: blocks access to `/auth/login` when already logged in, redirects to `/`.
  - `roleGuard(...roles)`: factory that blocks access when the signed-in user does not hold one of the given roles, redirecting to `/forbidden`. It is unit-tested, but **not wired to any route yet** — `app.routes.ts` imports only `authGuard` and `guestGuard`, and there is currently no `/forbidden` route, so add one before using it.

### 6.2 `core/http/`
- **[auth.interceptor.ts](../src/app/core/http/auth.interceptor.ts)** — adds the `Authorization: Bearer <access-token>` header to every outgoing request if the user is signed in.
- **[error.interceptor.ts](../src/app/core/http/error.interceptor.ts)** — catches HTTP errors globally. Shows a snackbar for network/server errors and handles 401 (force logout + redirect).

### 6.3 `core/mock/`
- **[seed.ts](../src/app/core/mock/seed.ts)** — deterministic fake data generator (users, products, orders, analytics, dashboard stats). Uses a seeded pseudo-random so the same data appears across reloads.
- **[mock-api.interceptor.ts](../src/app/core/mock/mock-api.interceptor.ts)** — the **heart of the "backend"**. It pattern-matches URLs like `/api/users`, `/api/products`, `/api/orders`, `/api/auth/login`, and returns fake `HttpResponse`s with a small artificial delay. It supports pagination (`page`, `pageSize`), searching, sorting, filtering, and POST/PUT/DELETE mutations against in-memory arrays. Without this, every HTTP call would fail with 404.

### 6.4 `core/i18n/`
- **[transloco-loader.ts](../src/app/core/i18n/transloco-loader.ts)** — tells Transloco how to fetch translation JSONs. It does `GET /assets/i18n/{lang}.json`.
- **[language.service.ts](../src/app/core/i18n/language.service.ts)** — thin wrapper around Transloco that:
  - Exposes the current language as a **signal** (`current`).
  - Exposes the available languages (`available` — with flag + label).
  - Persists the chosen language to `localStorage` so it survives reloads.
  - Subscribes to Transloco's `langChanges$` to keep the signal in sync (important for the checkmark in the language dropdown).

### 6.5 `core/services/`
- **[theme.service.ts](../src/app/core/services/theme.service.ts)** — manages dark/light mode. Stores the choice, toggles the `dark` CSS class on `<html>`, and respects the user's system preference on first visit.

### 6.6 `core/models/`
- **[index.ts](../src/app/core/models/index.ts)** — TypeScript interfaces shared across the app: `User`, `UserRole`, `PagedResult<T>`, `Query`, auth tokens, etc.

---

## 7. Features folder — one subfolder per page

### 7.1 `features/auth/` — the login page
- **[login.component.ts](../src/app/features/auth/login.component.ts)** — builds a reactive form with email/password, calls `AuthService.login(...)`, shows a spinner while the request is in flight, redirects to `/dashboard` on success.
- **[login.component.html](../src/app/features/auth/login.component.html)** — template with Material form fields, password visibility toggle, demo credentials hint. All user-facing strings come from `auth.*` keys in the translation files.

### 7.2 `features/dashboard/` — the dashboard home
- **[dashboard-home.component.ts](../src/app/features/dashboard/dashboard-home.component.ts)** — fetches `/api/dashboard/stats`, exposes:
  - `stats` signal (raw payload);
  - `kpis()` computed signal returning 4 cards with `labelKey`, `value`, `delta`, `icon`, `color`. The `labelKey` is a translation key (e.g. `dashboard.totalRevenue`) that the template pipes through `| transloco`.
- **[dashboard-home.component.html](../src/app/features/dashboard/dashboard-home.component.html)** — renders the 4 KPI cards, 2 charts (revenue line, users-by-role doughnut), and a recent-orders table.

### 7.3 `features/users/` — the most complex feature
This feature shows the full CRUD pattern and is the best example to learn from.

- **[users.api.ts](../src/app/features/users/users.api.ts)** — thin HTTP service: `list()`, `get()`, `create()`, `update()`, `remove()`. Just maps methods to URLs — no business logic.
- **[users.store.ts](../src/app/features/users/users.store.ts)** — state container built with **`@ngrx/signals`** (`signalStore`):
  - Holds `items`, `total`, `loading`, `query` (page, pageSize, search, sort).
  - Methods: `setQuery`, `load`, `refresh`, `create`, `update`, `remove`.
  - Acts like a view-model: the component reads from the store and tells it what to do, the store talks to `UsersApi`.
- **[user-form.dialog.ts](../src/app/features/users/user-form.dialog.ts)** — Material dialog (inline template) used for both "Create new user" and "Edit user". Returns the form payload via `MatDialogRef.close(...)` on submit.
- **[users.component.ts](../src/app/features/users/users.component.ts)** — the page:
  - Injects the `UsersStore` (scoped per-component via `providers: [UsersStore]`), `MatDialog`, `MatSnackBar`, `TranslocoService`.
  - Wires a debounced search `FormControl` to the store.
  - Opens the create/edit dialog, confirms deletes via `ConfirmDialogComponent`, shows translated snackbars.
- **[users.component.html](../src/app/features/users/users.component.html)** — Material table with sorting, paginator, row menu. All headers/buttons are translated via `| transloco`.

### 7.4 `features/products/` — grid view
- **[products.component.ts](../src/app/features/products/products.component.ts)** — keeps state as **plain signals** (no store this time — simpler). Watches 3 `FormControl`s (search, category, status) through an `effect()`, builds `HttpParams` and fetches `/api/products`.
- **[products.component.html](../src/app/features/products/products.component.html)** — responsive card grid, skeleton loader, empty state, paginator.

### 7.5 `features/orders/` — table with summary cards
Same pattern as products, but presents data in a Material table with summary cards (revenue, pending, shipped, delivered) computed from the current page.

### 7.6 `features/analytics/` — charts only
- **[analytics.component.ts](../src/app/features/analytics/analytics.component.ts)** — fetches `/api/analytics`, builds 4 `ChartConfiguration` objects via `computed()` signals, one per chart.
- **[analytics.component.html](../src/app/features/analytics/analytics.component.html)** — renders `canvas baseChart` elements (ng2-charts directive).

### 7.7 `features/settings/` — tabs
- **[settings.component.ts](../src/app/features/settings/settings.component.ts)** — three reactive forms (profile, password, notifications). The `save()` method shows a translated snackbar using `TranslocoService.translate(...)`.
- **[settings.component.html](../src/app/features/settings/settings.component.html)** — 4 Material tabs (Profile / Security / Notifications / Appearance). The Appearance tab binds theme buttons to `ThemeService`.

---

## 8. Layouts folder

### [dashboard-layout.component.ts/html/scss](../src/app/layouts/dashboard-layout/)
This is the shell used for every authenticated page (see the `children` in `app.routes.ts`). It renders:
- **Sidebar** with the nav links (uses `routerLink` + `routerLinkActive="is-active"` for highlighting).
- **Topbar** with welcome text, language dropdown, theme toggle, notifications, and the user chip menu.
- **`<router-outlet />`** in the main area — this is where the selected page (dashboard, users, …) is rendered.

The layout tracks responsive state via signals (`isMobile`, `collapsed`, `mobileOpen`) and swaps the sidebar between a rail (icons only) and the full version.

---

## 9. Shared folder

### [shared/ui/confirm.dialog.ts](../src/app/shared/ui/confirm.dialog.ts)
Reusable Material dialog for confirmations (title, message, optional variant `'danger'` for delete actions). Callers pass the text (already translated) via `MatDialog.open(ConfirmDialogComponent, { data: {...} })`.

### [shared/ui/placeholder.component.ts](../src/app/shared/ui/placeholder.component.ts)
A small "Coming soon" component — currently not routed, available for any stubbed-out page.

---

## 10. Internationalization (i18n) in depth

The whole app is translatable. Two languages live at:
- [public/assets/i18n/en.json](../public/assets/i18n/en.json)
- [public/assets/i18n/ro.json](../public/assets/i18n/ro.json)

They share the exact same tree of keys, grouped by feature: `common.*`, `nav.*`, `dashboard.*`, `users.*`, `products.*`, `orders.*`, `analytics.*`, `settings.*`, `auth.*`, `confirm.*`, `placeholder.*`, `layout.*`.

### How to use a key

**In a template (most common):**
```html
<h2>{{ 'users.title' | transloco }}</h2>
<input [placeholder]="'users.searchPlaceholder' | transloco" />
<p>{{ 'users.totalCount' | transloco: { count: store.total() } }}</p>
```
You must `import { TranslocoModule } from '@jsverse/transloco';` in the component's `imports`.

**In TypeScript (snackbars, dialog data, imperative code):**
```ts
private readonly transloco = inject(TranslocoService);
// ...
this.snack.open(this.transloco.translate('users.created'), ...);
```

### Switching language
Click the flag in the topbar. `LanguageService.set(code)` is called, which calls `transloco.setActiveLang(code)` and persists the choice. Because `reRenderOnLangChange: true` is set in [app.config.ts](../src/app/app.config.ts), all templates re-render automatically.

### Adding a new string
1. Add the key to **both** `en.json` **and** `ro.json`.
2. Use it in the template with `| transloco` or call `transloco.translate(...)` in TS.
3. Don't forget to import `TranslocoModule` in the component.

---

## 11. Styling — Tailwind + Material together

- **Tailwind CSS** is used for layout and spacing utilities (`flex`, `gap-4`, `p-6`, `text-sm`, `opacity-70`, `lg:grid-cols-3`, …). Config: [tailwind.config.js](../tailwind.config.js). Note `darkMode: 'class'` — dark mode is enabled by adding/removing a `dark` CSS class on `<html>` (done by `ThemeService`).
- **Angular Material** provides complex UI pieces (buttons, tables, form fields, tabs, dialogs, snackbars, menus). Theming uses Material 3 tokens exposed as CSS variables (`var(--mat-sys-surface)`, `var(--mat-sys-outline-variant)`, …).
- **Global styles**: [src/styles.scss](../src/styles.scss) pulls in Tailwind directives and a few custom classes (`.card`, `.nav-item`, …) used by the layout.

`html` has `color-scheme: light`. When `<html>` gets the class `dark`, we switch to `color-scheme: dark`. This is important because Material M3 colors use the CSS `light-dark()` function, which depends on `color-scheme`.

---

## 12. Testing (Vitest + Angular TestBed)

All tests live next to the code they test, suffixed with `.spec.ts`.

### How to run
```bash
# one-shot run (exactly what CI does)
npm test -- --watch=false

# watch mode (re-runs on file change)
npm test
```

### Status
104 tests passing across 23 spec files. Coverage: **93.4% statements, 86.3% branches, 96.4% lines** (`npm run test:coverage`).

### Important test helper
[src/testing/transloco-testing.ts](../src/testing/transloco-testing.ts) exposes:
```ts
provideTranslocoTesting()  // stub loader that returns of({})
```
When a component uses `| transloco` or injects `TranslocoService`, you must add `provideTranslocoTesting()` to the TestBed providers, otherwise the test will fail with a DI error.

### Typical component spec shape
```ts
TestBed.configureTestingModule({
  imports: [UsersComponent],
  providers: [
    provideNoopAnimations(),
    provideRouter([]),
    provideHttpClient(),
    provideHttpClientTesting(),
    provideTranslocoTesting(),
  ],
});
const fixture = TestBed.createComponent(UsersComponent);
fixture.detectChanges();
expect(fixture.componentInstance).toBeTruthy();
```

Tip: if the component makes HTTP calls in `ngOnInit`, use `HttpTestingController` to `flush()` the requests so the test is deterministic.

---

## 13. How to run the app locally

```bash
npm install                  # first time only
npm start                    # serves on http://localhost:4200
```

Log in with `admin@demo.com / admin123`. All data is mocked — try creating a user, toggling theme, switching language.

### Build production
```bash
npm run build                # outputs to dist/
```

---

## 14. Common tasks — how to…

### Add a new page
1. Create the component files in `src/app/features/<name>/`.
2. Add a route in [app.routes.ts](../src/app/app.routes.ts) using `loadComponent`.
3. Add a link in the sidebar's `nav` array in [dashboard-layout.component.ts](../src/app/layouts/dashboard-layout/dashboard-layout.component.ts).
4. Add translation keys under a new section in both `en.json` and `ro.json`.

### Add a new mock endpoint
Edit [mock-api.interceptor.ts](../src/app/core/mock/mock-api.interceptor.ts) and add a `if (url.startsWith('/api/whatever'))` branch that returns an `HttpResponse` via the helper used in the file.

### Add a new form field
Use reactive forms. Add the control to the `FormGroup`, bind with `formControlName="..."`, show errors with `@if (form.controls.xxx.hasError('required')) { <mat-error>...</mat-error> }`.

### Debug a failing API call
Open DevTools Network tab. You'll see the request but it's returned by the interceptor — to find the logic, search `/api/<the-path>` in [mock-api.interceptor.ts](../src/app/core/mock/mock-api.interceptor.ts).

---

## 15. Where to look first when you join

1. [app.routes.ts](../src/app/app.routes.ts) — big picture of pages.
2. [dashboard-layout.component.ts](../src/app/layouts/dashboard-layout/dashboard-layout.component.ts) — the shell everyone sees.
3. [users.component.ts](../src/app/features/users/users.component.ts) + [users.store.ts](../src/app/features/users/users.store.ts) — full CRUD reference, best example of modern patterns (signals, store, dialogs, snackbars, i18n, reactive search).
4. [mock-api.interceptor.ts](../src/app/core/mock/mock-api.interceptor.ts) — understand where the "backend" lives.
5. [app.config.ts](../src/app/app.config.ts) — global providers.

Good luck, and don't hesitate to ask!
