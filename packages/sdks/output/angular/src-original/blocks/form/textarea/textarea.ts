import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

/**
 * This import is used by the Svelte SDK. Do not remove.
 */

export interface TextareaProps {
  attributes?: any;
  name?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
}

import { filterAttrs } from "../../helpers";
import { setAttrs } from "../../helpers";

@Component({
  selector: "builder-textarea, BuilderTextarea",
  template: `
    <textarea
      [attr.placeholder]="placeholder"
      [attr.name]="name"
      [attr.value]="value"
      [attr.defaultValue]="defaultValue"
      [attr.required]="required"
    ></textarea>
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
export default class BuilderTextarea {
  @Input() attributes!: TextareaProps["attributes"];
  @Input() placeholder!: TextareaProps["placeholder"];
  @Input() name!: TextareaProps["name"];
  @Input() value!: TextareaProps["value"];
  @Input() defaultValue!: TextareaProps["defaultValue"];
  @Input() required!: TextareaProps["required"];
}
