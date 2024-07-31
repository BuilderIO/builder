import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

import DynamicRenderer from "../../components/dynamic-renderer/dynamic-renderer";
import { getClassPropName } from "../../functions/get-class-prop-name";
import { filterAttrs } from "../helpers";
import type { ButtonProps } from "./button.types";

@Component({
  selector: "builder-button, BuilderButton",
  template: `
    <dynamic-renderer
      [attributes]="node_0_DynamicRenderer"
      [TagName]="link ? builderLinkComponent || 'a' : 'button'"
      [actionAttributes]="node_1_DynamicRenderer"
    >
      {{text}}
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
export default class BuilderButton {
  @Input() attributes!: ButtonProps["attributes"];
  @Input() link!: ButtonProps["link"];
  @Input() openLinkInNewTab!: ButtonProps["openLinkInNewTab"];
  @Input() builderLinkComponent!: ButtonProps["builderLinkComponent"];
  @Input() text!: ButtonProps["text"];

  attrs() {
    return {
      ...this.attributes,
      [getClassPropName()]: `${this.link ? "" : "builder-button"} ${
        this.attributes[getClassPropName()] || ""
      }`,
      ...(this.link
        ? {
            href: this.link,
            target: this.openLinkInNewTab ? "_blank" : undefined,
            role: "link",
          }
        : {
            role: "button",
          }),
    };
  }
  node_0_DynamicRenderer = null;
  node_1_DynamicRenderer = null;

  ngOnInit() {
    this.node_0_DynamicRenderer = this.attrs();
    this.node_1_DynamicRenderer = {};
  }

  ngOnChanges() {
    if (typeof window !== "undefined") {
      this.node_0_DynamicRenderer = this.attrs();
      this.node_1_DynamicRenderer = {};
    }
  }
}
