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
    <ng-container *ngIf="tabList?.length">
      <button
        *ngFor="let tab of tabList; let i = index"
        [class.active]="activeTab === i"
        (click)="activeTab = i"
      >
        {{ tab.tabName }}
      </button>

      <ng-container *ngFor="let tab of tabList; let i = index">
        <ng-container *ngIf="activeTab === i">
          <blocks
            [blocks]="tabList[i].blocks"
            [path]="'tabList.' + i + '.blocks'"
            [parent]="builderBlock.id"
            [context]="builderContext"
            [registeredComponents]="builderComponents"
          />
        </ng-container>
      </ng-container>
    </ng-container>
  `,
})
export class CustomTabsComponent {
  @Input() builderBlock!: BuilderBlock;
  @Input() tabList: { tabName: string; blocks: BuilderBlock[] }[] = [];
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
