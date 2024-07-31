import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

import Blocks from "../../components/blocks/index";
import { camelToKebabCase } from "../../functions/camel-to-kebab-case";
import type { Dictionary } from "../../types/typescript";
import type { AccordionProps } from "./accordion.types";
import { convertOrderNumberToString } from "./helpers";

@Component({
  selector: "accordion, Accordion",
  template: `
    <div class="builder-accordion" [ngStyle]="accordionStyles">
      <ng-container *ngFor="let item of items; let index = index">
        <ng-container>
          <div
            [class]="node_0_div(item, index)"
            [ngStyle]="node_1_div(item, index)"
            [attr.data-index]="index"
            (click)="onClick(index)"
          >
            <Blocks
              [blocks]="item.title"
              [path]="node_3_Blocks(item, index)"
              [parent]="builderBlock.id"
              [context]="builderContext"
              [registeredComponents]="builderComponents"
              [linkComponent]="builderLinkComponent"
            ></Blocks>
          </div>
          <ng-container *ngIf="node_4_Show(item, index)">
            <div
              [class]="node_5_div(item, index)"
              [ngStyle]="accordionDetailStyles"
            >
              <Blocks
                [blocks]="item.detail"
                [path]="node_6_Blocks(item, index)"
                [parent]="builderBlock.id"
                [context]="builderContext"
                [registeredComponents]="builderComponents"
                [linkComponent]="builderLinkComponent"
              ></Blocks>
            </div>
          </ng-container>
        </ng-container>
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
export default class Accordion {
  @Input() grid!: AccordionProps["grid"];
  @Input() oneAtATime!: AccordionProps["oneAtATime"];
  @Input() gridRowWidth!: AccordionProps["gridRowWidth"];
  @Input() items!: AccordionProps["items"];
  @Input() builderBlock!: AccordionProps["builderBlock"];
  @Input() builderContext!: AccordionProps["builderContext"];
  @Input() builderComponents!: AccordionProps["builderComponents"];
  @Input() builderLinkComponent!: AccordionProps["builderLinkComponent"];

  open = [];
  get onlyOneAtATime() {
    return Boolean(this.grid || this.oneAtATime);
  }
  get accordionStyles() {
    const styles = {
      display: "flex" as "flex" | "none",
      alignItems: "stretch" as
        | "stretch"
        | "flex-start"
        | "flex-end"
        | "center"
        | "baseline",
      flexDirection: "column" as
        | "column"
        | "row"
        | "column-reverse"
        | "row-reverse",
      ...(this.grid && {
        flexDirection: "row" as
          | "column"
          | "row"
          | "column-reverse"
          | "row-reverse",
        alignItems: "flex-start" as
          | "stretch"
          | "flex-start"
          | "flex-end"
          | "center"
          | "baseline",
        flexWrap: "wrap" as "nowrap" | "wrap",
      }),
    };
    return styles;
  }
  get accordionTitleStyles() {
    const shared = {
      display: "flex",
      flexDirection: "column",
    };
    const styles = {
      ...shared,
      alignItems: "stretch",
      cursor: "pointer",
    };
    return Object.fromEntries(
      Object.entries(styles).filter(([_, value]) => value !== undefined)
    ) as Dictionary<string>;
  }
  getAccordionTitleClassName(index: number) {
    return `builder-accordion-title builder-accordion-title-${
      this.open.includes(index) ? "open" : "closed"
    }`;
  }
  getAccordionDetailClassName(index: number) {
    return `builder-accordion-detail builder-accordion-detail-${
      this.open.includes(index) ? "open" : "closed"
    }`;
  }
  get openGridItemOrder() {
    let itemOrder: number | null = null;
    const getOpenGridItemPosition = this.grid && this.open.length;
    if (getOpenGridItemPosition && document) {
      const openItemIndex = this.open[0];
      const openItem = document.querySelector(
        `.builder-accordion-title[data-index="${openItemIndex}"]`
      );
      let subjectItem = openItem;
      itemOrder = openItemIndex;
      if (subjectItem) {
        let prevItemRect = subjectItem.getBoundingClientRect();
        while ((subjectItem = subjectItem && subjectItem.nextElementSibling)) {
          if (subjectItem) {
            if (subjectItem.classList.contains("builder-accordion-detail")) {
              continue;
            }
            const subjectItemRect = subjectItem.getBoundingClientRect();
            if (subjectItemRect.left > prevItemRect.left) {
              const index = parseInt(
                subjectItem.getAttribute("data-index") || "",
                10
              );
              if (!isNaN(index)) {
                prevItemRect = subjectItemRect;
                itemOrder = index;
              }
            } else {
              break;
            }
          }
        }
      }
    }
    if (typeof itemOrder === "number") {
      itemOrder = itemOrder + 1;
    }
    return itemOrder;
  }
  get accordionDetailStyles() {
    const styles = {
      ...{
        order:
          typeof this.openGridItemOrder === "number"
            ? (this.openGridItemOrder as number)
            : undefined,
      },
      ...(this.grid && {
        width: "100%",
      }),
    };
    return Object.fromEntries(
      Object.entries(styles).filter(([_, value]) => value !== undefined)
    ) as Dictionary<string>;
  }
  onClick(index: number) {
    if (this.open.includes(index)) {
      this.open = this.onlyOneAtATime
        ? []
        : this.open.filter((item) => item !== index);
    } else {
      this.open = this.onlyOneAtATime ? [index] : this.open.concat(index);
    }
  }
  node_0_div = (item, index) => this.getAccordionTitleClassName(index);
  node_1_div = (item, index) => ({
    ...this.accordionTitleStyles,
    width: this.grid ? this.gridRowWidth : undefined,
    ...({
      order:
        this.openGridItemOrder !== null
          ? convertOrderNumberToString(index)
          : convertOrderNumberToString(index + 1),
    } as any),
  });
  node_3_Blocks = (item, index) => `items.${index}.title`;
  node_4_Show = (item, index) => this.open.includes(index);
  node_5_div = (item, index) => this.getAccordionDetailClassName(index);
  node_6_Blocks = (item, index) => `items.${index}.detail`;
}
