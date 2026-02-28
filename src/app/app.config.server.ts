import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/ssr';
import { appConfig } from './app.config';

// TODO: read this
// https://angular.io/api/common/http/provideHttpClient
const serverConfig: ApplicationConfig = {
  providers: [provideHttpClient(withFetch()), provideServerRendering()],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
