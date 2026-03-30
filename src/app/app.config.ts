import {
  ApplicationConfig,
  isDevMode,
  provideAppInitializer,
  provideZonelessChangeDetection,
} from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withViewTransitions,
} from '@angular/router';

import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideServiceWorker } from '@angular/service-worker';
import { ROUTES } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAppInitializer(() => {
      if (isDevMode()) {
        console.log('App initialized');
      }
    }),
    provideZonelessChangeDetection(),
    provideHttpClient(withFetch()),
    provideRouter(ROUTES, withComponentInputBinding(), withViewTransitions()),
    provideClientHydration(),
    provideAnimationsAsync(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: true, // isDevMode(), // see docs/todo — P1 #12: should be !isDevMode(); service worker must not run in dev; see docs/todo/tech-debt.md#service-worker-in-dev-mode
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
