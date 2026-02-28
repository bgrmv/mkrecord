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
import { provideAnimations } from '@angular/platform-browser/animations';
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
    provideRouter(ROUTES, withViewTransitions(), withComponentInputBinding()),
    provideClientHydration(),
    provideAnimations(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: false, // isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
