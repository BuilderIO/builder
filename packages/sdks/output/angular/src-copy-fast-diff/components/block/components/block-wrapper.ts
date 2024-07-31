import { Component, Input, SimpleChanges } from "@angular/core";
import { CommonModule } from "@angular/common";

type BlockWrapperProps = {
  Wrapper: string;
  block: BuilderBlock;
  context: BuilderContextInterface;
  children?: any;
};

/**
 * This component renders a block's wrapper HTML element (from the block's `tagName` property).
 */

import type { BuilderContextInterface } from "../../../context/types";
import { getBlockActions } from "../../../functions/get-block-actions";
import { getBlockProperties } from "../../../functions/get-block-properties";
import type { BuilderBlock } from "../../../types/builder-block";
import DynamicRenderer from "../../dynamic-renderer/dynamic-renderer";
import diff from "microdiff";

@Component({
  selector: "block-wrapper, BlockWrapper",
  template: `
    <dynamic-renderer
      [TagName]="Wrapper"
      [attributes]="node_0_DynamicRenderer"
      [actionAttributes]="node_1_DynamicRenderer"
    >
      <ng-content></ng-content>
    </dynamic-renderer>
  `,
  styles: [
    `
      :host {
        display: contents;
      }
    `,
  ],
  standalone: true,
  imports: [CommonModule, DynamicRenderer],
})
export default class BlockWrapper {
  @Input() block!: BlockWrapperProps["block"];
  @Input() context!: BlockWrapperProps["context"];
  @Input() Wrapper!: BlockWrapperProps["Wrapper"];

  node_0_DynamicRenderer = null;
  node_1_DynamicRenderer = null;

  ngOnInit() {
    this.node_0_DynamicRenderer = getBlockProperties({
      block: this.block,
      context: this.context,
    });
    this.node_1_DynamicRenderer = getBlockActions({
      block: this.block,
      rootState: this.context.rootState,
      rootSetState: this.context.rootSetState,
      localState: this.context.localState,
      context: this.context.context,
      stripPrefix: true,
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    const blockHasChanges = changes.block && changes.block.previousValue && changes.block.currentValue && diff(changes.block.previousValue, changes.block.currentValue).length > 0;
    const contextHasChanges = changes.context && changes.context.previousValue && changes.context.currentValue && diff(changes.context.previousValue, changes.context.currentValue).length > 0;
    if (typeof window !== "undefined") {
      if (blockHasChanges || contextHasChanges) {
        console.log('block-wrapper: ngOnChanges', changes);
        this.node_0_DynamicRenderer = getBlockProperties({
          block: this.block,
          context: this.context,
        });
        this.node_1_DynamicRenderer = getBlockActions({
          block: this.block,
        rootState: this.context.rootState,
        rootSetState: this.context.rootSetState,
        localState: this.context.localState,
        context: this.context.context,
        stripPrefix: true,
        });
      }
    }
  }
}
