import {
    provideZoneChangeDetection,
    type ApplicationConfig,
  } from '@angular/core';
  import { provideRouter } from '@angular/router';
  
  import { provideHttpClient, withFetch } from '@angular/common/http';
  import {
    provideClientHydration,
    withEventReplay,
  } from '@angular/platform-browser';
  import { routes } from './app.routes';
  
  export const appConfig: ApplicationConfig = {
    providers: [
      provideZoneChangeDetection({ eventCoalescing: true }),
      provideRouter(routes),
      provideClientHydration(withEventReplay()),
      provideHttpClient(withFetch()),
    ],
  };
  