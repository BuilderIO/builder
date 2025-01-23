import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import type {
  BuilderBlock,
  BuilderContextInterface,
  RegisteredComponent,
  RegisteredComponents,
} from '@builder.io/sdk-angular';
import { Blocks } from '@builder.io/sdk-angular';

@Component({
  selector: 'app-custom-columns',
  standalone: true,
  imports: [CommonModule, Blocks],
  template: `
    <blocks
      [blocks]="column1"
      [path]="'column1'"
      [parent]="builderBlock.id"
      [context]="builderContext"
      [registeredComponents]="builderComponents"
    />
    <blocks
      [blocks]="column2"
      [path]="'column2'"
      [parent]="builderBlock.id"
      [context]="builderContext"
      [registeredComponents]="builderComponents"
    />
  `,
})
export class CustomColumnsComponent {
  @Input() builderBlock!: BuilderBlock;
  @Input() column1!: BuilderBlock[];
  @Input() column2!: BuilderBlock[];
  @Input() builderComponents!: RegisteredComponents;
  @Input() builderContext!: BuilderContextInterface;
}

export const customColumnsInfo: RegisteredComponent = {
  name: 'MyColumns',
  component: CustomColumnsComponent,
  inputs: [
    {
      name: 'column1',
      type: 'uiBlocks',
      defaultValue: [],
    },
    {
      name: 'column2',
      type: 'uiBlocks',
      defaultValue: [],
    },
  ],

  shouldReceiveBuilderProps: {
    builderBlock: true,
    builderComponents: true,
    builderContext: true,
  },
};
