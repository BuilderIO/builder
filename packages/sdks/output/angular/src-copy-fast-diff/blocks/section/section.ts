import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

import { filterAttrs } from "../helpers";
import type { SectionProps } from "./section.types";
import { setAttrs } from "../helpers";

@Component({
  selector: "section-component, SectionComponent",
  template: `
    <section [ngStyle]="node_0_section"><ng-content></ng-content></section>
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
export default class SectionComponent {
  @Input() maxWidth!: SectionProps["maxWidth"];
  @Input() attributes!: SectionProps["attributes"];

  node_0_section = null;

  ngOnInit() {
    this.node_0_section = {
      width: "100%",
      alignSelf: "stretch",
      flexGrow: 1,
      boxSizing: "border-box",
      maxWidth: this.maxWidth || 1200,
      display: "flex",
      flexDirection: "column",
      alignItems: "stretch",
      marginLeft: "auto",
      marginRight: "auto",
    };
  }

  ngOnChanges() {
    if (typeof window !== "undefined") {
      this.node_0_section = {
        width: "100%",
        alignSelf: "stretch",
        flexGrow: 1,
        boxSizing: "border-box",
        maxWidth: this.maxWidth || 1200,
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        marginLeft: "auto",
        marginRight: "auto",
      };
    }
  }
}
