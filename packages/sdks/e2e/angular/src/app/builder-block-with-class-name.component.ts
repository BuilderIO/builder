import { Component, Input } from '@angular/core';
// import { BuilderBlock } from '@builder.io/sdk-angular';

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
  styles: [
    `
      .test-class-name {
        color: red;
      }
    `,
  ],
})
export class BuilderBlockWithClassNameComponent {
  testClassName = 'test-class-name';

  @Input() content: any;
  @Input() builderBlock: any;
  @Input() attributes: any;
  @Input() builderContext: any;
  @Input() builderComponents: any;

  ngOnInit() {
    console.log(this.content);
  }
}
