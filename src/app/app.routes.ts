import { Routes } from '@angular/router';
import { environment } from '../environments/environment';

export const ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./pages/home-page.component').then((m) => m.HomePageComponent),
  },
  {
    path: 'info',
    loadComponent: () =>
      import('./pages/info-page.component').then((m) => m.InfoPageComponent),
  },
  {
    path: 'portfolio',
    loadComponent: () =>
      import('./pages/portfolio-page.component').then(
        (m) => m.PortfolioPageComponent,
      ),
  },
  {
    path: 'contacts',
    loadComponent: () =>
      import('./pages/contacts-page.component').then(
        (m) => m.ContactsPageComponent,
      ),
  },
  {
    path: 'dashboard',
    // use canMatch (not canActivate) because it also blocks the lazy chunk from loading —
    // the unauthenticated admin bundle must not ship to prod until a real guard exists
    canMatch: [() => environment.featureFlags.dashboard],
    loadComponent: () =>
      import('./pages/dashboard-page.component').then(
        (m) => m.DashboardPageComponent,
      ),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./core/empty.component').then((m) => m.EmptyComponent),
  },
];
