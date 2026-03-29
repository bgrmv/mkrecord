import { Routes } from '@angular/router';

export const ROUTES: Routes = [
  {
    path: '',
    title: 'Home',
    pathMatch: 'full',
    loadComponent: () =>
      import('./pages/home-page.component').then((m) => m.HomePageComponent),
  },
  {
    path: 'home',
    title: 'Home',
    pathMatch: 'full',
    loadComponent: () =>
      import('./pages/home-page.component').then((m) => m.HomePageComponent),
  },
  {
    path: 'info',
    title: 'Info',
    loadComponent: () =>
      import('./pages/info-page.component').then((m) => m.InfoPageComponent),
  },
  {
    path: 'portfolio',
    title: 'Portfolio',
    loadComponent: () =>
      import('./pages/portfolio-page.component').then(
        (m) => m.PortfolioPageComponent,
      ),
  },
  {
    path: 'contacts',
    title: 'Contacts',
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
