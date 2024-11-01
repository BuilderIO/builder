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
    <div
      style="display: flex; flex-direction: row; justify-content: space-around; border: 10px solid #ccc; padding: 10px"
    >
      <blocks
        [blocks]="columns[0].blocks"
        [path]="'component.options.columns.0.blocks'"
        [parent]="builderBlock.id"
        [context]="builderContext"
        [registeredComponents]="builderComponents"
      ></blocks>
      <blocks
        [blocks]="columns[1].blocks"
        [path]="'component.options.columns.1.blocks'"
        [parent]="builderBlock.id"
        [context]="builderContext"
        [registeredComponents]="builderComponents"
      ></blocks>
    </div>
  `,
})
export class CustomColumnsComponent {
  @Input() builderBlock!: BuilderBlock;
  @Input() columns: { blocks: BuilderBlock[] }[] = [];
  @Input() builderComponents: RegisteredComponents = {};
  @Input() builderContext!: BuilderContextInterface;
}

export const customColumnsInfo: RegisteredComponent = {
  component: CustomColumnsComponent,
  name: 'MyColumns',
  inputs: [
    {
      name: 'columns',
      type: 'array',
      broadcast: true,
      hideFromUI: true,
      defaultValue: [{ blocks: [] }, { blocks: [] }],
    },
  ],
  shouldReceiveBuilderProps: {
    builderBlock: true,
    builderComponents: true,
    builderContext: true,
  },
};
