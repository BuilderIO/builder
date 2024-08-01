import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

import type { TextProps } from "./text.types";

@Component({
  selector: "builder-text, BuilderText",
  template: `
    <div
      class="builder-text"
      [innerHTML]="node_0_div"
      [ngStyle]="node_1_div"
    ></div>
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
export default class BuilderText {
  @Input() text!: TextProps["text"];

  node_0_div = null;
  node_1_div = null;

  ngOnInit() {
    this.node_0_div = this.text?.toString() || "";
    this.node_1_div = {
      outline: "none",
    };
  }

  ngOnChanges(changes) {
    if (typeof window !== "undefined") {
      if (changes.text) {
        this.node_0_div = this.text?.toString() || "";
      }
    }
  }
}
