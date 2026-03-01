import { Routes } from '@angular/router';
import { EmptyComponent } from './core/empty.component';
import { ContactsPageComponent } from './pages/contacts-page.component';
import { HomePageComponent } from './pages/home-page.component';
import { InfoPageComponent } from './pages/info-page.component';
import { PortfolioPageComponent } from './pages/portfolio-page.component';

export const ROUTES: Routes = [
  {
    path: '',
    title: 'Home',
    pathMatch: 'full',
    component: HomePageComponent,
  },
  {
    path: 'info',
    title: 'Info',
    component: InfoPageComponent,
  },
  {
    path: 'portfolio',
    title: 'Portfolio',
    component: PortfolioPageComponent,
  },
  {
    path: 'contacts',
    title: 'Contacts',
    component: ContactsPageComponent,
  },
  {
    path: '**',
    component: EmptyComponent,
  },
];
