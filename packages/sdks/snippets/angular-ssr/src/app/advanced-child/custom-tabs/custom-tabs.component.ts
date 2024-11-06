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
  selector: 'app-custom-tabs',
  standalone: true,
  imports: [CommonModule, Blocks],
  template: `
    <div>
      <h2>Custom Component with editable regions</h2>

      <div>
        <button
          *ngFor="let tab of tabList; let i = index"
          [class.active]="activeTab === i"
          (click)="activeTab = i"
        >
          {{ tab.tabName }}
        </button>
      </div>

      <div *ngIf="tabList?.length">
        <div *ngFor="let tab of tabList; let i = index">
          <div [style.display]="activeTab === i ? 'block' : 'none'">
            <blocks
              [blocks]="tabList[i].children"
              [path]="'component.options.tabList.' + i + '.children'"
              [parent]="builderBlock.id"
              [context]="builderContext"
              [registeredComponents]="builderComponents"
            ></blocks>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .active {
        background-color: #e0e0e0;
        font-weight: bold;
      }
    `,
  ],
})
export class CustomTabsComponent {
  @Input() builderBlock!: BuilderBlock;
  @Input() tabList: { tabName: string; children: BuilderBlock[] }[] = [];
  @Input() builderComponents: RegisteredComponents = {};
  @Input() builderContext!: BuilderContextInterface;

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
          hideFromUI: true,
          defaultValue: [
            {
              '@type': '@builder.io/sdk:Element',
              component: {
                name: 'Text',
                options: {
                  text: 'This is editable block within the builder editor',
                },
              },
              responsiveStyles: {
                large: {
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  flexShrink: '0',
                  boxSizing: 'border-box',
                  marginTop: '8px',
                  lineHeight: 'normal',
                  height: '200px',
                  textAlign: 'left',
                  minHeight: '200px',
                },
                small: {
                  height: '200px',
                },
              },
            },
          ],
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
