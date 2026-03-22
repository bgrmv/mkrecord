import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideServerRendering, RenderMode, ServerRoute, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';

const serverRoutes: ServerRoute[] = [
  { path: '**', renderMode: RenderMode.Server },
];

// TODO: read this
// https://angular.io/api/common/http/provideHttpClient
const serverConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch()),
    provideServerRendering(withRoutes(serverRoutes)),
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
