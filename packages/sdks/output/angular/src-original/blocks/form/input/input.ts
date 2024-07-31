import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

/**
 * This import is used by the Svelte SDK. Do not remove.
 */

export interface FormInputProps {
  type?: string;
  attributes?: any;
  name?: string;
  value?: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
}

import { isEditing } from "../../../functions/is-editing";
import { filterAttrs } from "../../helpers";
import { setAttrs } from "../../helpers";

@Component({
  selector: "form-input-component, FormInputComponent",
  template: `
    <input
      [attr.placeholder]="placeholder"
      [attr.type]="type"
      [attr.name]="name"
      [attr.value]="value"
      [attr.defaultValue]="defaultValue"
      [attr.required]="required"
    />
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
export default class FormInputComponent {
  @Input() defaultValue!: FormInputProps["defaultValue"];
  @Input() attributes!: FormInputProps["attributes"];
  @Input() placeholder!: FormInputProps["placeholder"];
  @Input() type!: FormInputProps["type"];
  @Input() name!: FormInputProps["name"];
  @Input() value!: FormInputProps["value"];
  @Input() required!: FormInputProps["required"];

  node_0_input = null;

  ngOnInit() {
    this.node_0_input =
      isEditing() && this.defaultValue ? this.defaultValue : "default-key";
  }

  ngOnChanges() {
    if (typeof window !== "undefined") {
      this.node_0_input =
        isEditing() && this.defaultValue ? this.defaultValue : "default-key";
    }
  }
}
