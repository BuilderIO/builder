import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import type {
  BuilderBlock,
  RegisteredComponent,
} from '@builder.io/sdk-angular';
import { Blocks } from '@builder.io/sdk-angular';
import type {
  BuilderContextInterface,
  RegisteredComponents,
} from '@builder.io/sdk-angular/lib/node/context/types';

@Component({
  selector: 'app-custom-columns',
  standalone: true,
  imports: [CommonModule, Blocks],
  template: `
    <blocks
      [blocks]="column1.blocks"
      [path]="'component.options.column1.blocks'"
      [parent]="builderBlock.id"
      [context]="builderContext"
      [registeredComponents]="builderComponents"
    />
    <blocks
      [blocks]="column2.blocks"
      [path]="'component.options.column2.blocks'"
      [parent]="builderBlock.id"
      [context]="builderContext"
      [registeredComponents]="builderComponents"
    />
  `,
})
export class CustomColumnsComponent {
  @Input() builderBlock!: BuilderBlock;
  @Input() column1!: { blocks: BuilderBlock[] };
  @Input() column2!: { blocks: BuilderBlock[] };
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
      broadcast: true,
      hideFromUI: true,
      defaultValue: {
        blocks: [],
      },
    },
    {
      name: 'column2',
      type: 'uiBlocks',
      broadcast: true,
      hideFromUI: true,
      defaultValue: {
        blocks: [],
      },
    },
  ],

  shouldReceiveBuilderProps: {
    builderBlock: true,
    builderComponents: true,
    builderContext: true,
  },
};
