import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

import Blocks from "../../components/blocks/blocks";
import type { BuilderBlock } from "../../types/builder-block";
import type { TabsProps } from "./tabs.types";

@Component({
  selector: "tabs, Tabs",
  template: `
    <div>
      <div class="builder-tabs-wrap" [ngStyle]="node_0_div">
        <ng-container
          *ngFor="let tab of tabs; let index = index; trackBy: trackByTab0"
        >
          <span
            [class]="node_1_span(tab, index)"
            [ngStyle]="node_2_span(tab, index)"
            (click)="onClick(index)"
          >
            <blocks
              [parent]="builderBlock.id"
              [path]="node_4_Blocks(tab, index)"
              [blocks]="tab.label"
              [context]="builderContext"
              [registeredComponents]="builderComponents"
              [linkComponent]="builderLinkComponent"
            ></blocks>
          </span>
        </ng-container>
      </div>
      <ng-container *ngIf="node_5_Show">
        <div>
          <blocks
            [parent]="builderBlock.id"
            [path]="node_6_Blocks"
            [blocks]="node_7_Blocks"
            [context]="builderContext"
            [registeredComponents]="builderComponents"
            [linkComponent]="builderLinkComponent"
          ></blocks>
        </div>
      </ng-container>
    </div>
  `,
  styles: [
    `
      :host {
        display: contents;
      }
    `,
  ],
  standalone: true,
  imports: [CommonModule, Blocks],
})
export default class Tabs {
  @Input() tabHeaderLayout!: TabsProps["tabHeaderLayout"];
  @Input() defaultActiveTab!: TabsProps["defaultActiveTab"];
  @Input() tabs!: TabsProps["tabs"];
  @Input() collapsible!: TabsProps["collapsible"];
  @Input() activeTabStyle!: TabsProps["activeTabStyle"];
  @Input() builderBlock!: TabsProps["builderBlock"];
  @Input() builderContext!: TabsProps["builderContext"];
  @Input() builderComponents!: TabsProps["builderComponents"];
  @Input() builderLinkComponent!: TabsProps["builderLinkComponent"];

  activeTab = this.defaultActiveTab ? this.defaultActiveTab - 1 : 0;
  activeTabContent(active: number) {
    return this.tabs && this.tabs[active].content;
  }
  onClick(index: number) {
    if (index === this.activeTab && this.collapsible) {
      this.activeTab = -1;
    } else {
      this.activeTab = index;
    }
  }
  node_0_div = null;
  node_1_span = (tab, index) =>
    `builder-tab-wrap ${this.activeTab === index ? "builder-tab-active" : ""}`;
  node_2_span = (tab, index) => ({
    ...(this.activeTab === index ? this.activeTabStyle : {}),
  });
  node_4_Blocks = (tab, index) => `component.options.tabs.${index}.label`;
  node_5_Show = null;
  node_6_Blocks = null;
  node_7_Blocks = null;
  trackByTab0(index, tab) {
    return index;
  }

  ngOnInit() {
    this.node_0_div = {
      display: "flex",
      flexDirection: "row",
      justifyContent: this.tabHeaderLayout || "flex-start",
      overflow: "auto",
    };
    this.node_5_Show = this.activeTabContent(this.activeTab);
    this.node_6_Blocks = `component.options.tabs.${this.activeTab}.content`;
    this.node_7_Blocks = this.activeTabContent(this.activeTab);
  }

  ngOnChanges() {
    if (typeof window !== "undefined") {
      this.node_0_div = {
        display: "flex",
        flexDirection: "row",
        justifyContent: this.tabHeaderLayout || "flex-start",
        overflow: "auto",
      };
      this.node_5_Show = this.activeTabContent(this.activeTab);
      this.node_6_Blocks = `component.options.tabs.${this.activeTab}.content`;
      this.node_7_Blocks = this.activeTabContent(this.activeTab);
    }
  }
}
