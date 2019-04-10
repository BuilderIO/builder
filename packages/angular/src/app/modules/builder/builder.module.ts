import { NgModule, ModuleWithProviders, InjectionToken } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BuilderContentComponent } from './components/builder-content/builder-content.component';
import { BuilderContentDirective } from './directives/builder-content.directive';
import { BuilderRenderComponent } from './components/builder-render/builder-render.component';
import { BuilderRichTextComponent } from './components/builder-rich-text/builder-rich-text.component';
import { BuilderColumnsComponent } from './components/builder-columns/builder-columns.component';
import { BUILDER_API_KEY, BuilderService } from './services/builder.service';
import { BuilderContentService } from './services/builder-content.service';
import { BuilderEmbedComponent } from './components/builder-embed/builder-embed.component';
import { BuilderBlocksComponent } from './components/builder-blocks/builder-blocks.component';
import { BuilderImageComponent } from './components/builder-image/builder-image.component';
import { BuilderDividerComponent } from './components/builder-divider/builder-divider.component';
import { BuilderCanvasComponent } from './components/builder-canvas/builder-canvas.component';
import { BuilderElementComponent } from './components/builder-element/builder-element.component';
import { BuilderComponentComponent } from './components/builder-component/builder-component.component';
import { BuilderComponentService } from './components/builder-component/builder-component.service';

const directives = [BuilderContentDirective];

const components = [
  BuilderColumnsComponent,
  BuilderRichTextComponent,
  BuilderEmbedComponent,
  BuilderImageComponent,
  BuilderDividerComponent,
  BuilderCanvasComponent,
  BuilderElementComponent,
  BuilderContentComponent,
  BuilderBlocksComponent,
  BuilderRenderComponent,
  BuilderComponentComponent,
];

@NgModule({
  imports: [CommonModule],
  providers: [BuilderService, BuilderContentService, BuilderComponentService],
  declarations: [components, directives],
  exports: [components, directives],
  entryComponents: [components],
})
export class BuilderModule {
  public static forRoot(apiKey?: string): ModuleWithProviders {
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
