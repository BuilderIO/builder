import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

export type DropzoneProps = BuilderDataProps & {
  name: string;
  attributes: any;
};

import Blocks from "../../components/blocks/blocks";
import { deoptSignal } from "../../functions/deopt";
import type { BuilderBlock } from "../../types/builder-block";
import type { BuilderDataProps } from "../../types/builder-props";

@Component({
  selector: "builder-slot, BuilderSlot",
  template: `
    <div [ngStyle]="node_0_div" [attr.node_1_div]="node_1_div">
      <blocks
        [parent]="node_2_Blocks"
        [path]="node_3_Blocks"
        [context]="builderContext"
        [blocks]="node_4_Blocks"
      ></blocks>
    </div>
  `,
  styles: [
    `
      :host {
        display: contents;
      }
    `,
  ],
  standalone: true,
  imports: [CommonModule, Blocks],
})
export default class BuilderSlot {
  @Input() builderContext!: DropzoneProps["builderContext"];
  @Input() name!: DropzoneProps["name"];

  node_0_div = null;
  node_1_div = null;
  node_2_Blocks = null;
  node_3_Blocks = null;
  node_4_Blocks = null;

  ngOnInit() {
    this.node_0_div = {
      pointerEvents: "auto",
    };
    this.node_1_div = {
      ...(!this.builderContext.context?.symbolId && {
        "builder-slot": this.name,
      }),
    };
    this.node_2_Blocks = this.builderContext.context?.symbolId as string;
    this.node_3_Blocks = `symbol.data.${this.name}`;
    this.node_4_Blocks = this.builderContext.rootState?.[
      this.name
    ] as BuilderBlock[];
  }

  ngOnChanges() {
    if (typeof window !== "undefined") {
      this.node_0_div = {
        pointerEvents: "auto",
      };
      this.node_1_div = {
        ...(!this.builderContext.context?.symbolId && {
          "builder-slot": this.name,
        }),
      };
      this.node_2_Blocks = this.builderContext.context?.symbolId as string;
      this.node_3_Blocks = `symbol.data.${this.name}`;
      this.node_4_Blocks = this.builderContext.rootState?.[
        this.name
      ] as BuilderBlock[];
    }
  }
}
