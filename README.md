# Admin Dashboard

Angular 21 admin dashboard — standalone components, signals, zoneless change detection, and a self-contained mock backend so the whole thing runs with a single `npm start`.

> **Demo credentials:** `admin@demo.com` / `admin123`

![Angular](https://img.shields.io/badge/Angular-21-DD0031?logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38BDF8?logo=tailwindcss&logoColor=white)
![NgRx Signals](https://img.shields.io/badge/NgRx-SignalStore-BA2BD2?logo=ngrx&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## Highlights

- **Modern Angular** — standalone components, signals, `inject()`, functional guards & interceptors, zoneless-ready.
- **Strict TypeScript** — `strict`, `strictTemplates`, `noImplicitReturns`, `noPropertyAccessFromIndexSignature`.
- **State management** — `@ngrx/signals` Signal Store (see [`UsersStore`](src/app/features/users/users.store.ts)) with computed selectors and `rxMethod`-driven async flows.
- **Self-contained** — an HTTP interceptor ([`mockApiInterceptor`](src/app/core/mock/mock-api.interceptor.ts)) serves the entire `/api/*` surface from in-memory seed data with realistic latency, pagination, sorting and search.
- **i18n** — Transloco with English + Romanian, runtime language switching, ~140 keys.
- **Theming** — class-based dark mode, system-aware, persisted across reloads.
- **Tested** — Vitest unit suite covering services, guards, interceptors, the signal store, dialogs and feature components (~93% statements / ~96% lines).
- **CI** — GitHub Actions workflow runs lint, tests and a production build on every push and PR.

## Stack

| Concern        | Choice                                       |
| -------------- | -------------------------------------------- |
| Framework      | Angular 21 (standalone, signals, zoneless)   |
| State          | `@ngrx/signals` (Signal Store)               |
| UI             | Angular Material + TailwindCSS 3             |
| Charts         | Chart.js via `ng2-charts`                    |
| Forms          | Reactive Forms                               |
| HTTP           | `HttpClient` + functional interceptors       |
| Routing        | Standalone routes + lazy loading             |
| i18n           | `@jsverse/transloco`                         |
| Tests          | Vitest + `@vitest/coverage-v8` + jsdom       |
| Tooling        | ESLint, Prettier, EditorConfig               |

## Architecture

```
src/app/
├── core/           # cross-cutting: auth, http, i18n, mock API, services, models
│   ├── auth/       # AuthService (signals) + auth/guest/role guards
│   ├── http/       # auth + error interceptors
│   ├── i18n/       # Transloco loader + LanguageService
│   ├── mock/       # in-memory HTTP interceptor + seed data
│   ├── models/     # domain types
│   └── services/   # ThemeService
├── shared/ui/      # presentational primitives (ConfirmDialog, Placeholder)
├── layouts/        # DashboardLayout (sidebar + topbar shell)
└── features/       # lazy-loaded route bundles
    ├── auth/       # login (Reactive Forms)
    ├── dashboard/  # KPI cards + charts + recent orders
    ├── users/      # CRUD with NgRx Signal Store + MatTable
    ├── products/   # filterable grid
    ├── orders/     # table with summary cards
    ├── analytics/  # multi-chart page
    └── settings/   # tabbed settings (profile / security / notifications / appearance)
```

The interceptor pipeline is wired in [`app.config.ts`](src/app/app.config.ts) as `[authInterceptor, errorInterceptor, mockApiInterceptor]` — the order matters: auth attaches the token first, the error handler wraps everything, and the mock runs last so real auth/error logic sits on top of the synthetic responses.

## Getting started

```bash
npm install --legacy-peer-deps
npm start
```

Open <http://localhost:4200>. The app boots straight into the login page — sign in with the demo credentials above. No backend required.

### Available scripts

| Command                 | What it does                                         |
| ----------------------- | ---------------------------------------------------- |
| `npm start`             | Dev server on port 4200 with HMR                     |
| `npm run build`         | Production build (output in `dist/`)                 |
| `npm test`              | Vitest unit suite                                    |
| `npm run test:coverage` | Vitest with V8 coverage report (`coverage/`)         |
| `npm run lint`          | ESLint over `src/`                                   |
| `npm run format`        | Prettier write across the workspace                  |

### Environment

The app talks to `/api`, which is intercepted by the mock layer. To point at a real backend later, copy `.env.example` to `.env` and override `NG_APP_API_BASE_URL`.

## Project structure quick map

- **Routing:** [`src/app/app.routes.ts`](src/app/app.routes.ts) — every feature is lazy-loaded.
- **Auth flow:** [`AuthService`](src/app/core/auth/auth.service.ts) + [`auth.guards.ts`](src/app/core/auth/auth.guards.ts) + [`auth.interceptor.ts`](src/app/core/http/auth.interceptor.ts).
- **Mock API:** [`mock-api.interceptor.ts`](src/app/core/mock/mock-api.interceptor.ts) covers auth, paginated `/api/users`, products, orders, analytics and dashboard stats. Seed data lives in [`seed.ts`](src/app/core/mock/seed.ts).
- **State example:** [`features/users/users.store.ts`](src/app/features/users/users.store.ts) is the canonical example of a Signal Store + `rxMethod` CRUD flow.
- **Tests:** colocated `.spec.ts` files. See [`features/users/users.component.spec.ts`](src/app/features/users/users.component.spec.ts) for a representative integration-style test.

A longer architectural walkthrough lives in [docs/ONBOARDING.md](docs/ONBOARDING.md).

## Development notes

- The repository uses `legacy-peer-deps=true` (see [`.npmrc`](.npmrc)) because some Material 21 packages still publish loose peer ranges.
- Signals + zoneless mean change detection runs only when a signal changes or an event fires — avoid pushing imperative state into components; reach for a signal or a Signal Store method instead.
- All user-facing strings go through Transloco. Add new keys to both [`en.json`](public/assets/i18n/en.json) and [`ro.json`](public/assets/i18n/ro.json).

## Roadmap

Future improvements I’d like to explore:

- Playwright E2E suite covering login → CRUD → logout.
- Server-side rendering with Angular Universal.
- Real backend swap-in (NestJS) replacing the mock interceptor.
- More analytics widgets (cohort retention, funnel breakdown).

## License

[MIT](LICENSE)
