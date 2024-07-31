import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

/**
 * This import is used by the Svelte SDK. Do not remove.
 */

export interface ButtonProps {
  attributes?: any;
  text?: string;
}

import { filterAttrs } from "../../helpers";
import { setAttrs } from "../../helpers";

@Component({
  selector: "submit-button, SubmitButton",
  template: `
    <button type="submit">{{text}}</button>
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
export default class SubmitButton {
  @Input() attributes!: ButtonProps["attributes"];
  @Input() text!: ButtonProps["text"];
}
