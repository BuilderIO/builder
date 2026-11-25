import { InjectionToken, type Provider } from '@angular/core';

/**
 * Set by `provideBuilderHydration()`. Server and browser both need it: the server
 * decides the markup, and the browser must render the same shape to hydrate it.
 */
export const BUILDER_HYDRATION = new InjectionToken<boolean>(
  'BUILDER_HYDRATION'
);

/**
 * Lets Angular hydrate Builder content instead of re-rendering it in the browser.
 * Provide it in the app config (server and browser). Content with A/B variants,
 * personalization, or opened in the Builder editor or preview is still re-rendered.
 */
export function provideBuilderHydration(): Provider {
  return { provide: BUILDER_HYDRATION, useValue: true };
}
