import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

import BuilderContext from "../../context/builder.context";
import ComponentsContext from "../../context/components.context";
import Block from "../block/block";
import BlocksWrapper from "./blocks-wrapper";
import type { BlocksProps } from "./blocks.types";

@Component({
  selector: "blocks, Blocks",
  template: `
    <blocks-wrapper
      [blocks]="blocks"
      [parent]="parent"
      [path]="path"
      [styleProp]="styleProp"
      [BlocksWrapper]="context?.BlocksWrapper || builderContext.BlocksWrapper"
      [BlocksWrapperProps]="context?.BlocksWrapperProps || builderContext.BlocksWrapperProps"
    >
      <ng-container *ngIf="blocks">
        <ng-container *ngFor="let block of blocks; trackBy: trackByBlock0">
          <block
            [block]="block"
            [linkComponent]="linkComponent"
            [context]="context || builderContext"
            [registeredComponents]="registeredComponents || componentsContext.registeredComponents"
          ></block>
        </ng-container>
      </ng-container>
    </blocks-wrapper>
  `,
  styles: [
    `
      :host {
        display: contents;
      }
    `,
  ],
  standalone: true,
  imports: [CommonModule, BlocksWrapper, Block],
})
export default class Blocks {
  @Input() blocks!: BlocksProps["blocks"];
  @Input() parent!: BlocksProps["parent"];
  @Input() path!: BlocksProps["path"];
  @Input() styleProp!: BlocksProps["styleProp"];
  @Input() context!: BlocksProps["context"];
  @Input() linkComponent!: BlocksProps["linkComponent"];
  @Input() registeredComponents!: BlocksProps["registeredComponents"];

  trackByBlock0(_, block) {
    return block.id;
  }

  constructor(
    public builderContext: BuilderContext,
    public componentsContext: ComponentsContext
  ) {}
}
