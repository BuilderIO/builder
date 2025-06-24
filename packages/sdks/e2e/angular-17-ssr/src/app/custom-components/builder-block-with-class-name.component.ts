import { Component, input } from '@angular/core';
import { Blocks } from '@builder.io/sdk-angular';

@Component({
  selector: 'app-builder-block-with-class-name',
  template: `
    <div>
      <blocks
        [blocks]="content()"
        [parent]="builderBlock()?.id"
        path="component.options.content"
        [className]="testClassName"
        [context]="builderContext()"
        [registeredComponents]="builderComponents()"
      ></blocks>
    </div>
  `,
  standalone: true,
  imports: [Blocks],
})
export class BuilderBlockWithClassNameComponent {
  testClassName = 'test-class-name';

  content = input<any>();
  builderBlock = input<any>();
  attributes = input<any>();
  builderContext = input<any>();
  builderComponents = input<any>();
}
