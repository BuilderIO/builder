import { Component, input } from '@angular/core';
import type {
  BuilderBlock,
  BuilderContextInterface,
  RegisteredComponent,
  RegisteredComponents,
} from '@builder.io/sdk-angular';
import { Blocks } from '@builder.io/sdk-angular';

@Component({
  selector: 'app-custom-tabs',
  standalone: true,
  imports: [Blocks],
  template: `
    @if (tabList().length) {
      @for (tab of tabList(); track $index) {
        <button
          [class.active]="activeTab === $index"
          (click)="activeTab = $index"
        >
          {{ tab.tabName }}
        </button>
      }

      <blocks
        [blocks]="tabList()[activeTab].blocks"
        [path]="'tabList.' + activeTab + '.blocks'"
        [parent]="builderBlock().id"
        [context]="builderContext()"
        [registeredComponents]="builderComponents()"
      />
    }
  `,
})
export class CustomTabsComponent {
  builderBlock = input.required<BuilderBlock>();
  tabList = input<{ tabName: string; blocks: BuilderBlock[] }[]>([]);
  builderComponents = input<RegisteredComponents>({});
  builderContext = input.required<BuilderContextInterface>();

  activeTab = 0;
}

export const customTabsInfo: RegisteredComponent = {
  component: CustomTabsComponent,
  name: 'TabFields',
  inputs: [
    {
      name: 'tabList',
      type: 'list',
      subFields: [
        {
          name: 'tabName',
          type: 'string',
        },
        {
          name: 'blocks',
          type: 'uiBlocks',
          defaultValue: [],
        },
      ],
    },
  ],
  shouldReceiveBuilderProps: {
    builderBlock: true,
    builderComponents: true,
    builderContext: true,
  },
};
