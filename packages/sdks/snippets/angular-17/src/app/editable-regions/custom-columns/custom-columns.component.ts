import { Component, input } from '@angular/core';
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
  imports: [Blocks],
  template: `
    <blocks
      [blocks]="column1()"
      [path]="'column1'"
      [parent]="builderBlock().id"
      [context]="builderContext()"
      [registeredComponents]="builderComponents()"
    />
    <blocks
      [blocks]="column2()"
      [path]="'column2'"
      [parent]="builderBlock().id"
      [context]="builderContext()"
      [registeredComponents]="builderComponents()"
    />
  `,
})
export class CustomColumnsComponent {
  builderBlock = input.required<BuilderBlock>();
  column1 = input.required<BuilderBlock[]>();
  column2 = input.required<BuilderBlock[]>();
  builderComponents = input.required<RegisteredComponents>();
  builderContext = input.required<BuilderContextInterface>();
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
