import {
  Component,
  ViewChild,
  ElementRef,
  Input,
  ViewContainerRef,
  TemplateRef,
forwardRef } from "@angular/core";
import { CommonModule } from "@angular/common";

import { wrapComponentRef } from "../../../content/wrap-component-ref";
import Block from "../../block";
import InteractiveElement from "../interactive-element";
import type { ComponentProps } from "./component-ref.helpers";
import { getWrapperProps } from "./component-ref.helpers";

@Component({
  selector: "component-ref, ComponentRef",
  template: `
    <ng-template #wrapperTemplate>
      <ng-container *ngIf="componentRef">
<ng-container *ngFor="let child of blockChildren; trackBy: trackByChild0">
        <block
          [block]="child"
          [context]="context"
          [registeredComponents]="registeredComponents"
          [linkComponent]="linkComponent"
        ></block>
      </ng-container>
</ng-container>
    </ng-template>
    <ng-container *ngIf="componentRef">
      <ng-container
        *ngComponentOutlet="
              Wrapper;
              inputs: mergedInputs_v6przu;
              content: myContent;
              "
      ></ng-container>
    </ng-container>
  `,
  styles: [
    `
      :host {
        display: contents;
      }
    `,
  ],
  standalone: true,
  imports: [CommonModule, forwardRef(() => Block)],
})
export default class ComponentRef {
  @Input() componentOptions!: ComponentProps["componentOptions"];
  @Input() builderBlock!: ComponentProps["builderBlock"];
  @Input() context!: ComponentProps["context"];
  @Input() componentRef!: ComponentProps["componentRef"];
  @Input() linkComponent!: ComponentProps["linkComponent"];
  @Input() includeBlockProps!: ComponentProps["includeBlockProps"];
  @Input() isInteractive!: ComponentProps["isInteractive"];
  @Input() blockChildren!: ComponentProps["blockChildren"];
  @Input() registeredComponents!: ComponentProps["registeredComponents"];

  @ViewChild("wrapperTemplate", { static: true })
  wrapperTemplateRef!: TemplateRef<any>;

  myContent?: any[][];

  Wrapper = this.isInteractive ? InteractiveElement : this.componentRef;
  node_0_state_Wrapper = null;
  mergedInputs_v6przu = null;
  trackByChild0(_, child) {
    return child.id;
  }

  constructor(private vcRef: ViewContainerRef) {}

  ngOnInit() {
  this.Wrapper = this.isInteractive ? InteractiveElement : this.componentRef;
    this.node_0_state_Wrapper = {
      ...getWrapperProps({
        componentOptions: this.componentOptions,
        builderBlock: this.builderBlock,
        context: this.context,
        componentRef: this.componentRef,
        linkComponent: this.linkComponent,
        includeBlockProps: this.includeBlockProps,
        isInteractive: this.isInteractive,
        contextValue: this.context,
      }),
    };
    this.mergedInputs_v6przu = { ...this.node_0_state_Wrapper };

    this.myContent = [
      this.vcRef.createEmbeddedView(this.wrapperTemplateRef).rootNodes,
    ];
  }

  ngOnChanges() {
    if (typeof window !== "undefined") {
      this.node_0_state_Wrapper = {
        ...getWrapperProps({
          componentOptions: this.componentOptions,
          builderBlock: this.builderBlock,
          context: this.context,
          componentRef: this.componentRef,
          linkComponent: this.linkComponent,
          includeBlockProps: this.includeBlockProps,
          isInteractive: this.isInteractive,
          contextValue: this.context,
        }),
      };
      this.mergedInputs_v6przu = { ...this.node_0_state_Wrapper };
    }
  }
}
