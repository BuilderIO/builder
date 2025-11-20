import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

// The Angular SSR builder passes a `BootstrapContext` object that contains
// request-specific information (HTML document, URL, etc.).
// From Angular v20.3 the context **must** be forwarded to `bootstrapApplication`
// otherwise the runtime throws NG0401: "Missing Platform".

export default function bootstrap(context: unknown) {
  return bootstrapApplication(AppComponent, config, context as any);
}
