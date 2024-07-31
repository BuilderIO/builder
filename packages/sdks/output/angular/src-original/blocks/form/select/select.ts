import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

/**
 * This import is used by the Svelte SDK. Do not remove.
 */

export interface FormSelectProps {
  options?: {
    name?: string;
    value: string;
  }[];
  attributes?: any;
  name?: string;
  value?: string;
  defaultValue?: string;
  required?: boolean;
}

import { isEditing } from "../../../functions/is-editing";
import { filterAttrs } from "../../helpers";
import { setAttrs } from "../../helpers";

@Component({
  selector: "select-component, SelectComponent",
  template: `
    <select
      [attr.value]="value"
      [attr.defaultValue]="defaultValue"
      [attr.name]="name"
      [attr.required]="required"
    >
      <ng-container
        *ngFor="let option of options; let index = index; trackBy: trackByOption0"
      >
        <option [attr.value]="option.value">
          {{option.name || option.value}}
        </option>
      </ng-container>
    </select>
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
export default class SelectComponent {
  @Input() defaultValue!: FormSelectProps["defaultValue"];
  @Input() attributes!: FormSelectProps["attributes"];
  @Input() value!: FormSelectProps["value"];
  @Input() name!: FormSelectProps["name"];
  @Input() required!: FormSelectProps["required"];
  @Input() options!: FormSelectProps["options"];

  node_0_select = null;
  trackByOption0(index, option) {
    return `${option.name}-${index}`;
  }

  ngOnInit() {
    this.node_0_select =
      isEditing() && this.defaultValue ? this.defaultValue : "default-key";
  }

  ngOnChanges() {
    if (typeof window !== "undefined") {
      this.node_0_select =
        isEditing() && this.defaultValue ? this.defaultValue : "default-key";
    }
  }
}
