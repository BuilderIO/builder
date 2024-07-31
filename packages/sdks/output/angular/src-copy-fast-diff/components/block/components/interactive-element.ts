import {
  Component,
  ViewChild,
  ElementRef,
  Input,
  ViewContainerRef,
  TemplateRef,
} from "@angular/core";
import { CommonModule } from "@angular/common";

export type InteractiveElementProps = {
  Wrapper: any;
  block: BuilderBlock;
  context: BuilderContextInterface;
  wrapperProps: Dictionary<any>;
  includeBlockProps: boolean;
  children?: any;
};

import type { BuilderContextInterface } from "../../../context/types";
import { getBlockActions } from "../../../functions/get-block-actions";
import { getBlockProperties } from "../../../functions/get-block-properties";
import type { BuilderBlock } from "../../../types/builder-block";
import type { Dictionary } from "../../../types/typescript";

@Component({
  selector: "interactive-element, InteractiveElement",
  template: `
    <ng-template #wrapperTemplate><ng-content></ng-content></ng-template>
    <ng-container
      *ngComponentOutlet="
              Wrapper;
              inputs: mergedInputs_atkjh2;
              content: myContent;
              "
    ></ng-container>
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
export default class InteractiveElement {
  @Input() includeBlockProps!: InteractiveElementProps["includeBlockProps"];
  @Input() block!: InteractiveElementProps["block"];
  @Input() context!: InteractiveElementProps["context"];
  @Input() wrapperProps!: InteractiveElementProps["wrapperProps"];
  @Input() Wrapper!: InteractiveElementProps["Wrapper"];

  @ViewChild("wrapperTemplate", { static: true })
  wrapperTemplateRef!: TemplateRef<any>;

  myContent?: any[][];

  get attributes() {
    return this.includeBlockProps
      ? {
          ...getBlockProperties({
            block: this.block,
            context: this.context,
          }),
          ...getBlockActions({
            block: this.block,
            rootState: this.context.rootState,
            rootSetState: this.context.rootSetState,
            localState: this.context.localState,
            context: this.context.context,
          }),
        }
      : {};
  }
  mergedInputs_atkjh2 = null;

  constructor(private vcRef: ViewContainerRef) {}

  ngOnInit() {
    this.mergedInputs_atkjh2 = {
      ...this.wrapperProps,
      attributes: this.attributes,
    };

    this.myContent = [
      this.vcRef.createEmbeddedView(this.wrapperTemplateRef).rootNodes,
    ];
  }
}
