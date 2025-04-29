import { Component, Input } from '@angular/core';
import { Blocks } from '@builder.io/sdk-angular';

@Component({
  selector: 'builder-block-with-class-name',
  template: `
    <div class="builder-block-with-class-name-styling">
      <blocks
        [blocks]="content"
      ></blocks>
    </div>
  `,
  standalone: true,
  imports: [Blocks],
})
export class BuilderBlockWithClassNameComponent {
  @Input() content: any;
  @Input() builderContext: any;
  @Input() builderComponents: any;
  @Input() builderBlock: any;
} 