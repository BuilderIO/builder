import './polyfills/custom-elements-es5-adapter';
import { Builder } from '@builder.io/sdk';
import { NgModule, ModuleWithProviders, Injector, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { BuilderContentComponent } from './components/builder-content/builder-content.component';
import { BuilderContentDirective } from './directives/builder-content.directive';
import { BUILDER_API_KEY, BuilderService } from './services/builder.service';
import { BuilderContentService } from './services/builder-content.service';
import { BuilderBlocksComponent } from './components/builder-blocks/builder-blocks.component';
import { BuilderBlocksOutletComponent } from './components/builder-blocks-outlet/builder-blocks-outlet.component';

import { BuilderComponentComponent } from './components/builder-component/builder-component.component';
import { BuilderComponentService } from './components/builder-component/builder-component.service';

Builder.isStatic = true;

const directives = [BuilderContentDirective];

const components = [
  BuilderContentComponent,
  BuilderBlocksComponent,
  BuilderComponentComponent,
  BuilderBlocksOutletComponent,
];

@NgModule({
  imports: [CommonModule],
  providers: [BuilderService, BuilderContentService, BuilderComponentService],
  declarations: [components, directives],
  exports: [components, directives],
})
export class BuilderModule {
  constructor(injector: Injector, @Inject(PLATFORM_ID) private platformId: string) {
    if (isPlatformBrowser(platformId)) {
      // This cannot use a normal import, via https://github.com/angular/angular/issues/24551
      // Cannot use require, so use import. This otherwise breaks at runtime
      import('@angular/elements').then(({ createCustomElement }) => {
        for (const component of Builder.components) {
          if (
            component.class &&
            component.type === 'angular' &&
            component.tag &&
            typeof customElements.get(component.tag) === 'undefined'
          ) {
            try {
              const Element = createCustomElement(component.class, { injector });
              // Register the custom element with the browser.
              customElements.define(component.tag, Element);
            } catch (err) {
              console.warn('Could not make angular element:', component.class);
            }
          }
        }
      });
    }
  }

  public static forRoot(apiKey?: string): ModuleWithProviders<BuilderModule> {
    return {
      ngModule: BuilderModule,
      providers: [
        {
          provide: BUILDER_API_KEY,
          useValue: apiKey,
        },
      ],
    };
  }
}
