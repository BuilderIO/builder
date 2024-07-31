import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

export type BlockProps = {
  block: BuilderBlock;
  context: BuilderContextInterface;
  registeredComponents: RegisteredComponents;
  linkComponent: any;
};

import type {
  BuilderContextInterface,
  RegisteredComponents,
} from "../../context/types";
import { getBlockComponentOptions } from "../../functions/get-block-component-options";
import { getProcessedBlock } from "../../functions/get-processed-block";
import type { BuilderBlock } from "../../types/builder-block";
import DynamicDiv from "../dynamic-div";
import { bindAnimations } from "./animator";
import {
  getComponent,
  getInheritedStyles,
  getRepeatItemData,
  provideBuilderBlock,
  provideBuilderContext,
  provideLinkComponent,
  provideRegisteredComponents,
} from "./block.helpers";
import BlockStyles from "./components/block-styles";
import BlockWrapper from "./components/block-wrapper";
import type { ComponentProps } from "./components/component-ref/component-ref.helpers";
import ComponentRef from "./components/component-ref/component-ref";
import RepeatedBlock from "./components/repeated-block";

@Component({
  selector: "block, Block",
  template: `
    <ng-container *ngIf="canShowBlock">
      <block-styles [block]="block" [context]="context"></block-styles>
      <ng-container *ngIf="!blockComponent?.noWrap">
        <ng-container *ngIf="!repeatItem">
          <block-wrapper
            [Wrapper]="Tag"
            [block]="processedBlock"
            [context]="context"
          >
            <component-ref
              [blockChildren]="processedBlock.children"
              [componentRef]="blockComponent?.component"
              [componentOptions]="componentRefProps.componentOptions"
              [context]="context"
              [registeredComponents]="registeredComponents"
              [linkComponent]="linkComponent"
              [builderBlock]="processedBlock"
              [includeBlockProps]="blockComponent?.noWrap === true"
              [isInteractive]="!blockComponent?.isRSC"
            ></component-ref>
            <ng-container
              *ngFor="let child of childrenWithoutParentComponent; trackBy: trackByChild0"
            >
              <Block
                [block]="child"
                [registeredComponents]="registeredComponents"
                [linkComponent]="linkComponent"
                [context]="context"
              ></Block>
            </ng-container>
          </block-wrapper>
        </ng-container>
        <ng-container *ngIf="!(!repeatItem)">
          <ng-container
            *ngFor="let data of repeatItem; let index = index; trackBy: trackByData1"
          >
            <repeated-block
              [repeatContext]="data.context"
              [block]="data.block"
              [registeredComponents]="registeredComponents"
              [linkComponent]="linkComponent"
            ></repeated-block>
          </ng-container>
        </ng-container>
      </ng-container>
      <ng-container *ngIf="!(!blockComponent?.noWrap)">
        <component-ref
          [componentRef]="componentRefProps.componentRef"
          [componentOptions]="componentRefProps.componentOptions"
          [blockChildren]="componentRefProps.blockChildren"
          [context]="componentRefProps.context"
          [registeredComponents]="componentRefProps.registeredComponents"
          [linkComponent]="componentRefProps.linkComponent"
          [builderBlock]="componentRefProps.builderBlock"
          [includeBlockProps]="componentRefProps.includeBlockProps"
          [isInteractive]="componentRefProps.isInteractive"
        ></component-ref>
      </ng-container>
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
  imports: [
    CommonModule,
    BlockStyles,
    ComponentRef,
    RepeatedBlock,
    BlockWrapper,
    Block,
  ],
})
export default class Block {
  @Input() block!: BlockProps["block"];
  @Input() context!: BlockProps["context"];
  @Input() registeredComponents!: BlockProps["registeredComponents"];
  @Input() linkComponent!: BlockProps["linkComponent"];

  get blockComponent() {
    return getComponent({
      block: this.block,
      context: this.context,
      registeredComponents: this.registeredComponents,
    });
  }
  get repeatItem() {
    return getRepeatItemData({
      block: this.block,
      context: this.context,
    });
  }
  get processedBlock() {
    return this.block.repeat?.collection
      ? this.block
      : getProcessedBlock({
          block: this.block,
          localState: this.context.localState,
          rootState: this.context.rootState,
          rootSetState: this.context.rootSetState,
          context: this.context.context,
          shouldEvaluateBindings: true,
        });
  }
  get Tag() {
    const shouldUseLink =
      this.block.tagName === "a" ||
      this.processedBlock.properties?.href ||
      this.processedBlock.href;
    if (shouldUseLink) {
      return this.linkComponent || "a";
    }
    return DynamicDiv;
  }
  get canShowBlock() {
    if (this.block.repeat?.collection) {
      if (this.repeatItem?.length) return true;
      return false;
    }
    const shouldHide =
      "hide" in this.processedBlock ? this.processedBlock.hide : false;
    const shouldShow =
      "show" in this.processedBlock ? this.processedBlock.show : true;
    return shouldShow && !shouldHide;
  }
  get childrenWithoutParentComponent() {
    /**
     * When there is no `componentRef`, there might still be children that need to be rendered. In this case,
     * we render them outside of `componentRef`.
     * NOTE: We make sure not to render this if `repeatItemData` is non-null, because that means we are rendering an array of
     * blocks, and the children will be repeated within those blocks.
     */
    const shouldRenderChildrenOutsideRef =
      !this.blockComponent?.component && !this.repeatItem;
    return shouldRenderChildrenOutsideRef
      ? this.processedBlock.children ?? []
      : [];
  }
  get componentRefProps() {
    return {
      blockChildren: this.processedBlock.children ?? [],
      componentRef: this.blockComponent?.component,
      componentOptions: {
        ...getBlockComponentOptions(this.processedBlock),
        ...provideBuilderBlock(this.blockComponent, this.processedBlock),
        ...provideBuilderContext(this.blockComponent, this.context),
        ...provideLinkComponent(this.blockComponent, this.linkComponent),
        ...provideRegisteredComponents(
          this.blockComponent,
          this.registeredComponents
        ),
      },
      context: this.context,
      linkComponent: this.linkComponent,
      registeredComponents: this.registeredComponents,
      builderBlock: this.processedBlock,
      includeBlockProps: this.blockComponent?.noWrap === true,
      isInteractive: !this.blockComponent?.isRSC,
    };
  }
  trackByChild0(_, child) {
    return child.id;
  }
  trackByData1(index, data) {
    return index;
  }

  ngOnInit() {
    if (typeof window !== "undefined") {
      const blockId = this.processedBlock.id;
      const animations = this.processedBlock.animations;
      if (animations && blockId) {
        bindAnimations(
          animations.map((animation) => ({
            ...animation,
            elementId: blockId,
          }))
        );
      }
    }
  }
}
