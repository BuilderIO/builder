import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-builder-block-with-class-name',
  template: `
    <div>
      <blocks
        [blocks]="content"
        [parent]="builderBlock?.id"
        path="component.options.content"
        [className]="testClassName"
        [context]="builderContext"
        [registeredComponents]="builderComponents"
      ></blocks>
    </div>
  `,
})
export class BuilderBlockWithClassNameComponent {
  testClassName = 'test-class-name';

  @Input() content: any;
  @Input() builderBlock: any;
  @Input() attributes: any;
  @Input() builderContext: any;
  @Input() builderComponents: any;
}
