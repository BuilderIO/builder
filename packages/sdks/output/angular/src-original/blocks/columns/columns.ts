import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

type CSSVal = string | number;

import Blocks from "../../components/blocks/blocks";
import DynamicDiv from "../../components/dynamic-div";
import DynamicRenderer from "../../components/dynamic-renderer/dynamic-renderer";
import InlinedStyles from "../../components/inlined-styles";
import type { SizeName } from "../../constants/device-sizes";
import { getSizesForBreakpoints } from "../../constants/device-sizes";
import { TARGET } from "../../constants/target";
import { deoptSignal } from "../../functions/deopt";
import { getClassPropName } from "../../functions/get-class-prop-name";
import { mapStyleObjToStrIfNeeded } from "../../functions/get-style";
import type { Dictionary } from "../../types/typescript";
import type { Column, ColumnProps } from "./columns.types";
import { getColumnsClass } from "./helpers";

@Component({
  selector: "columns, Columns",
  template: `
    <div [class]="node_0_div + ' div'" [ngStyle]="node_1_div">
      <ng-container *ngIf="TARGET !== 'reactNative'">
        <inlined-styles
          id="builderio-columns"
          [styles]="node_2_InlinedStyles"
          [nonce]="builderContext.nonce"
        ></inlined-styles>
      </ng-container>
      <ng-container
        *ngFor="let column of columns; let index = index; trackBy: trackByColumn0"
      >
        <dynamic-renderer
          [TagName]="node_3_DynamicRenderer(column, index)"
          [actionAttributes]="node_4_DynamicRenderer(column, index)"
          [attributes]="node_5_DynamicRenderer(column, index)"
        >
          <blocks
            [path]="node_6_Blocks(column, index)"
            [parent]="builderBlock.id"
            [styleProp]="node_7_Blocks(column, index)"
            [context]="builderContext"
            [registeredComponents]="builderComponents"
            [linkComponent]="builderLinkComponent"
            [blocks]="column.blocks"
          ></blocks>
        </dynamic-renderer>
      </ng-container>
    </div>
  `,
  styles: [
    `
      :host {
        display: contents;
      }
      .div {
        display: flex;
        line-height: normal;
      }
    `,
  ],
  standalone: true,
  imports: [CommonModule, InlinedStyles, DynamicRenderer, Blocks],
})
export default class Columns {
  TARGET = TARGET;

  @Input() builderBlock!: ColumnProps["builderBlock"];
  @Input() space!: ColumnProps["space"];
  @Input() columns!: ColumnProps["columns"];
  @Input() stackColumnsAt!: ColumnProps["stackColumnsAt"];
  @Input() builderLinkComponent!: ColumnProps["builderLinkComponent"];
  @Input() reverseColumnsWhenStacked!: ColumnProps["reverseColumnsWhenStacked"];
  @Input() builderContext!: ColumnProps["builderContext"];
  @Input() builderComponents!: ColumnProps["builderComponents"];

  gutterSize = typeof this.space === "number" ? this.space || 0 : 20;
  cols = this.columns || [];
  stackAt = this.stackColumnsAt || "tablet";
  getTagName(column: Column) {
    return column.link ? this.builderLinkComponent || "a" : DynamicDiv;
  }
  getWidth(index: number) {
    return this.cols[index]?.width || 100 / this.cols.length;
  }
  getColumnCssWidth(index: number) {
    const width = this.getWidth(index);
    const subtractWidth =
      this.gutterSize * (this.cols.length - 1) * (width / 100);
    return `calc(${width}% - ${subtractWidth}px)`;
  }
  getTabletStyle({
    stackedStyle,
    desktopStyle,
  }: {
    stackedStyle: CSSVal;
    desktopStyle: CSSVal;
  }) {
    return this.stackAt === "tablet" ? stackedStyle : desktopStyle;
  }
  getMobileStyle({
    stackedStyle,
    desktopStyle,
  }: {
    stackedStyle: CSSVal;
    desktopStyle: CSSVal;
  }) {
    return this.stackAt === "never" ? desktopStyle : stackedStyle;
  }
  flexDir =
    this.stackColumnsAt === "never"
      ? "row"
      : this.reverseColumnsWhenStacked
      ? "column-reverse"
      : "column";
  columnsCssVars() {
    return {
      "--flex-dir": this.flexDir,
      "--flex-dir-tablet": this.getTabletStyle({
        stackedStyle: this.flexDir,
        desktopStyle: "row",
      }),
    } as Dictionary<string>;
  }
  columnCssVars(index: number) {
    const gutter = index === 0 ? 0 : this.gutterSize;
    const width = this.getColumnCssWidth(index);
    const gutterPixels = `${gutter}px`;
    const mobileWidth = "100%";
    const mobileMarginLeft = 0;
    const marginLeftKey = "margin-left";
    const sharedStyles = {
      display: "flex",
      flexDirection: "column",
      alignItems: "stretch",
    };
    return {
      ...sharedStyles,
      width,
      [marginLeftKey]: gutterPixels,
      "--column-width-mobile": this.getMobileStyle({
        stackedStyle: mobileWidth,
        desktopStyle: width,
      }),
      "--column-margin-left-mobile": this.getMobileStyle({
        stackedStyle: mobileMarginLeft,
        desktopStyle: gutterPixels,
      }),
      "--column-width-tablet": this.getTabletStyle({
        stackedStyle: mobileWidth,
        desktopStyle: width,
      }),
      "--column-margin-left-tablet": this.getTabletStyle({
        stackedStyle: mobileMarginLeft,
        desktopStyle: gutterPixels,
      }),
    } as Dictionary<string>;
  }
  getWidthForBreakpointSize(size: SizeName) {
    const breakpointSizes = getSizesForBreakpoints(
      this.builderContext.content?.meta?.breakpoints || {}
    );
    return breakpointSizes[size].max;
  }
  columnsStyles() {
    return `
        @media (max-width: ${this.getWidthForBreakpointSize("medium")}px) {
          .${this.builderBlock.id}-breakpoints {
            flex-direction: var(--flex-dir-tablet);
            align-items: stretch;
          }

          .${this.builderBlock.id}-breakpoints > .builder-column {
            width: var(--column-width-tablet) !important;
            margin-left: var(--column-margin-left-tablet) !important;
          }
        }

        @media (max-width: ${this.getWidthForBreakpointSize("small")}px) {
          .${this.builderBlock.id}-breakpoints {
            flex-direction: var(--flex-dir);
            align-items: stretch;
          }

          .${this.builderBlock.id}-breakpoints > .builder-column {
            width: var(--column-width-mobile) !important;
            margin-left: var(--column-margin-left-mobile) !important;
          }
        },
      `;
  }
  getAttributes(column: any, index: number) {
    return {
      ...{},
      ...(column.link
        ? {
            href: column.link,
          }
        : {}),
      [getClassPropName()]: "builder-column",
      style: mapStyleObjToStrIfNeeded(this.columnCssVars(index)),
    };
  }
  node_0_div = null;
  node_1_div = null;
  node_2_InlinedStyles = null;
  node_3_DynamicRenderer = (column, index) => this.getTagName(column);
  node_4_DynamicRenderer = (column, index) => ({});
  node_5_DynamicRenderer = (column, index) => this.getAttributes(column, index);
  node_6_Blocks = (column, index) =>
    `component.options.columns.${index}.blocks`;
  node_7_Blocks = (column, index) => ({
    flexGrow: "1",
  });
  trackByColumn0(index, column) {
    return index;
  }

  ngOnInit() {
    this.node_0_div = getColumnsClass(this.builderBlock?.id);
    this.node_1_div = this.columnsCssVars();
    this.node_2_InlinedStyles = this.columnsStyles();
  }

  ngOnChanges() {
    if (typeof window !== "undefined") {
      this.node_0_div = getColumnsClass(this.builderBlock?.id);
      this.node_1_div = this.columnsCssVars();
      this.node_2_InlinedStyles = this.columnsStyles();
    }
  }
}
