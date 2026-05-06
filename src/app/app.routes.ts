import { Routes } from '@angular/router';

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
    path: '**',
    loadComponent: () =>
      import('./core/empty.component').then((m) => m.EmptyComponent),
  },
];
