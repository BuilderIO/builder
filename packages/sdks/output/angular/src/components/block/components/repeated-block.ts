import { Component, Input ,forwardRef } from "@angular/core";
import { CommonModule } from "@angular/common";

type Props = Omit<BlockProps, "context"> & {
  repeatContext: BuilderContextInterface;
};

import BuilderContext from "../../../context/builder.context";
import type { BuilderContextInterface } from "../../../context/types";
import type { BlockProps } from "../block";
import Block from "../block";

@Component({
  selector: "repeated-block, RepeatedBlock",
  template: `
    <block
      [block]="block"
      [context]="store"
      [registeredComponents]="registeredComponents"
      [linkComponent]="linkComponent"
    ></block>
  `,
  styles: [
    `
      :host {
        display: contents;
      }
    `,
  ],
  standalone: true,
  imports: [CommonModule, forwardRef(() => Block)],
})
export default class RepeatedBlock {
  @Input() repeatContext!: Props["repeatContext"];
  @Input() block!: Props["block"];
  @Input() registeredComponents!: Props["registeredComponents"];
  @Input() linkComponent!: Props["linkComponent"];

  store = this.repeatContext;
}
