import { mergeApplicationConfig, type ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { provideBuilderHydration } from '@builder.io/sdk-angular';
import { appConfig } from './app.config';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    // Opt-in hydration for measurements: `BUILDER_HYDRATION=1 yarn serve`.
    // Unset (default) keeps Builder content on `ngSkipHydration`.
    ...(process.env['BUILDER_HYDRATION'] === '1'
      ? [provideBuilderHydration()]
      : []),
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
