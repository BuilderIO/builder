import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

/**
 * This import is used by the Svelte SDK. Do not remove.
 */

export interface ImgProps {
  attributes?: any;
  imgSrc?: string; // TODO(misko): I think this is unused
  image?: string;
  altText?: string;
  backgroundSize?: "cover" | "contain";
  backgroundPosition?:
    | "center"
    | "top"
    | "left"
    | "right"
    | "bottom"
    | "top left"
    | "top right"
    | "bottom left"
    | "bottom right";
}

import { isEditing } from "../../functions/is-editing";
import { filterAttrs } from "../helpers";
import { setAttrs } from "../helpers";

@Component({
  selector: "img-component, ImgComponent",
  template: `
    <img
      [ngStyle]="node_0_img"
      [attr.alt]="altText"
      [attr.src]="imgSrc || image"
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
export default class ImgComponent {
  @Input() backgroundSize!: ImgProps["backgroundSize"];
  @Input() backgroundPosition!: ImgProps["backgroundPosition"];
  @Input() imgSrc!: ImgProps["imgSrc"];
  @Input() altText!: ImgProps["altText"];
  @Input() image!: ImgProps["image"];
  @Input() attributes!: ImgProps["attributes"];

  node_0_img = null;
  node_1_img = null;

  ngOnInit() {
    this.node_0_img = {
      objectFit: this.backgroundSize || "cover",
      objectPosition: this.backgroundPosition || "center",
    };
    this.node_1_img = (isEditing() && this.imgSrc) || "default-key";
  }

  ngOnChanges() {
    if (typeof window !== "undefined") {
      this.node_0_img = {
        objectFit: this.backgroundSize || "cover",
        objectPosition: this.backgroundPosition || "center",
      };
      this.node_1_img = (isEditing() && this.imgSrc) || "default-key";
    }
  }
}
