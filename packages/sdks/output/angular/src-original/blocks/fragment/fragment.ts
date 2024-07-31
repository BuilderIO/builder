import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";

import type { FragmentProps } from "./fragment.types";

@Component({
  selector: "fragment-component, FragmentComponent",
  template: `
    <span><ng-content></ng-content></span>
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
export default class FragmentComponent {}
