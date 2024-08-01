import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

export interface RawTextProps {
  attributes?: any;
  text?: string;
}

@Component({
  selector: "raw-text, RawText",
  template: `
    <div [innerHTML]="node_0_div" [class]="attributes.class"></div>
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
export default class RawText {
  @Input() text!: RawTextProps["text"];
  @Input() attributes!: RawTextProps["attributes"];

  node_0_div = null;

  ngOnInit() {
    this.node_0_div = this.text?.toString() || "";
  }

  ngOnChanges() {
    if (typeof window !== "undefined") {
      this.node_0_div = this.text?.toString() || "";
    }
  }
}
