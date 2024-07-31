import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

export interface BaseTextProps {
  text: string;
}

import BuilderContext from "../context/builder.context";

@Component({
  selector: "base-text, BaseText",
  template: `
    <span [ngStyle]="node_0_span">{{text}}</span>
  `,
  styles: [
    `
      :host {
        display: contents;
      }
    `,
  ],
  standalone: true,
  imports: [CommonModule],
})
export default class BaseText {
  @Input() text!: BaseTextProps["text"];

  node_0_span = null;

  constructor(public builderContext: BuilderContext) {}

  ngOnInit() {
    this.node_0_span = this.builderContext.inheritedStyles as any;
  }

  ngOnChanges() {
    if (typeof window !== "undefined") {
      this.node_0_span = this.builderContext.inheritedStyles as any;
    }
  }
}
