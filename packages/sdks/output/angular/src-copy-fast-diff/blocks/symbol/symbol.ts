import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

import ContentVariants from "../../components/content-variants/index";
import type { BuilderContent } from "../../types/builder-content";
import { filterAttrs } from "../helpers";
import DynamicDiv from "../../components/dynamic-div";
import { getClassPropName } from "../../functions/get-class-prop-name";
import type { Nullable } from "../../types/typescript";
import { setAttrs } from "../helpers";
import { fetchSymbolContent } from "./symbol.helpers";
import type { SymbolProps } from "./symbol.types";

@Component({
  selector: "builder-symbol, BuilderSymbol",
  template: `
    <div [class]="className">
      <content-variants
        [nonce]="builderContext.nonce"
        [isNestedRender]="true"
        [apiVersion]="builderContext.apiVersion"
        [apiKey]="builderContext.apiKey!"
        [context]="node_0_ContentVariants"
        [customComponents]="node_1_ContentVariants"
        [data]="node_2_ContentVariants"
        [canTrack]="builderContext.canTrack"
        [model]="symbol?.model"
        [content]="contentToUse"
        [linkComponent]="builderLinkComponent"
        [blocksWrapper]="blocksWrapper"
        [contentWrapper]="contentWrapper"
      ></content-variants>
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
  imports: [CommonModule, ContentVariants],
})
export default class BuilderSymbol {
  @Input() symbol!: SymbolProps["symbol"];
  @Input() renderToLiquid!: SymbolProps["renderToLiquid"];
  @Input() dataOnly!: SymbolProps["dataOnly"];
  @Input() inheritState!: SymbolProps["inheritState"];
  @Input() builderContext!: SymbolProps["builderContext"];
  @Input() builderBlock!: SymbolProps["builderBlock"];
  @Input() builderComponents!: SymbolProps["builderComponents"];
  @Input() attributes!: SymbolProps["attributes"];
  @Input() dynamic!: SymbolProps["dynamic"];
  @Input() builderLinkComponent!: SymbolProps["builderLinkComponent"];

  get blocksWrapper() {
    return DynamicDiv;
  }
  get contentWrapper() {
    return DynamicDiv;
  }
  get className() {
    return [
      ...[this.attributes[getClassPropName()]],
      "builder-symbol",
      this.symbol?.inline ? "builder-inline-symbol" : undefined,
      this.symbol?.dynamic || this.dynamic
        ? "builder-dynamic-symbol"
        : undefined,
    ]
      .filter(Boolean)
      .join(" ");
  }
  contentToUse = this.symbol?.content;
  setContent() {
    if (this.contentToUse) return;
    fetchSymbolContent({
      symbol: this.symbol,
      builderContextValue: this.builderContext,
    }).then((newContent) => {
      if (newContent) {
        this.contentToUse = newContent;
      }
    });
  }
  node_0_ContentVariants = null;
  node_1_ContentVariants = null;
  node_2_ContentVariants = null;

  ngOnInit() {
    this.node_0_ContentVariants = {
      ...this.builderContext.context,
      symbolId: this.builderBlock?.id,
    };
    this.node_1_ContentVariants = Object.values(this.builderComponents);
    this.node_2_ContentVariants = {
      ...this.symbol?.data,
      ...this.builderContext.localState,
      ...this.contentToUse?.data?.state,
    };

    if (typeof window !== "undefined") {
      this.contentToUse = this.symbol?.content;
    }
  }

  ngOnChanges(changes) {
    if (typeof window !== "undefined") {
      if (changes.symbol) { this.setContent(); }
      const x =
        String(this.renderToLiquid) +
        String(this.dataOnly) +
        String(this.inheritState);
      console.log(x);
      this.node_0_ContentVariants = {
        ...this.builderContext.context,
        symbolId: this.builderBlock?.id,
      };
      this.node_1_ContentVariants = Object.values(this.builderComponents);
      this.node_2_ContentVariants = {
        ...this.symbol?.data,
        ...this.builderContext.localState,
        ...this.contentToUse?.data?.state,
      };
    }
  }
}
