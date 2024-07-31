import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

import { getSrcSet } from "./image.helpers";
import type { ImageProps } from "./image.types";

@Component({
  selector: "builder-image, BuilderImage",
  template: `
    <ng-container>
      <picture>
        <ng-container *ngIf="webpSrcSet">
          <source type="image/webp" [attr.srcset]="webpSrcSet" />
        </ng-container>
        <img
          [attr.data-a]="lazy"
          [attr.data-b]="attributes"
          [attr.loading]="highPriority ? 'eager' : 'lazy'"
          [attr.fetchpriority]="highPriority ? 'high' : 'auto'"
          [attr.alt]="altText"
          [attr.role]="altText ? undefined : 'presentation'"
          [ngStyle]="node_0_img"
          [class]="node_1_img + ' img'"
          [attr.src]="image"
          [attr.srcset]="srcSetToUse"
          [attr.sizes]="sizes"
        />
      </picture>
      <ng-container *ngIf="node_2_Show">
        <div class="builder-image-sizer div" [ngStyle]="node_3_div"></div>
      </ng-container>
      <ng-container *ngIf="builderBlock?.children?.length && fitContent">
        <ng-content></ng-content>
      </ng-container>
      <ng-container *ngIf="!fitContent && builderBlock?.children?.length">
        <div class="div-2"><ng-content></ng-content></div>
      </ng-container>
    </ng-container>
  `,
  styles: [
    `
      :host {
        display: contents;
      }
      .img {
        opacity: 1;
        transition: opacity 0.2s ease-in-out;
      }
      .div {
        width: 100%;
        pointer-events: none;
        font-size: 0;
      }
      .div-2 {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
    `,
  ],
  standalone: true,
  imports: [CommonModule],
})
export default class BuilderImage {
  @Input() backgroundPosition!: ImageProps["backgroundPosition"];
  @Input() backgroundSize!: ImageProps["backgroundSize"];
  @Input() className!: ImageProps["className"];
  @Input() aspectRatio!: ImageProps["aspectRatio"];
  @Input() builderBlock!: ImageProps["builderBlock"];
  @Input() fitContent!: ImageProps["fitContent"];
  @Input() image!: ImageProps["image"];
  @Input() src!: ImageProps["src"];
  @Input() srcset!: ImageProps["srcset"];
  @Input() noWebp!: ImageProps["noWebp"];
  @Input() lazy!: ImageProps["lazy"];
  @Input() attributes!: ImageProps["attributes"];
  @Input() highPriority!: ImageProps["highPriority"];
  @Input() altText!: ImageProps["altText"];
  @Input() sizes!: ImageProps["sizes"];

  get srcSetToUse() {
    const imageToUse = this.image || this.src;
    const url = imageToUse;
    if (
      !url ||
      // We can auto add srcset for cdn.builder.io and shopify
      // images, otherwise you can supply this prop manually
      !(url.match(/builder\.io/) || url.match(/cdn\.shopify\.com/))
    ) {
      return this.srcset;
    }
    if (this.noWebp) {
      return undefined; // no need to add srcset to svg images
    }
    if (this.srcset && this.image?.includes("builder.io/api/v1/image")) {
      if (!this.srcset.includes(this.image.split("?")[0])) {
        console.debug("Removed given srcset");
        return getSrcSet(url);
      }
    } else if (this.image && !this.srcset) {
      return getSrcSet(url);
    }
    return getSrcSet(url);
  }
  get webpSrcSet() {
    if (this.srcSetToUse?.match(/builder\.io/) && !this.noWebp) {
      return this.srcSetToUse.replace(/\?/g, "?format=webp&");
    } else {
      return "";
    }
  }
  get aspectRatioCss() {
    const aspectRatioStyles = {
      position: "absolute",
      height: "100%",
      width: "100%",
      left: "0px",
      top: "0px",
    } as const;
    const out = this.aspectRatio ? aspectRatioStyles : undefined;
    return out;
  }
  node_0_img = null;
  node_1_img = null;
  node_2_Show = null;
  node_3_div = null;

  ngOnInit() {
    this.node_0_img = {
      objectPosition: this.backgroundPosition || "center",
      objectFit: this.backgroundSize || "cover",
      ...this.aspectRatioCss,
    };
    this.node_1_img =
      "builder-image" + (this.className ? " " + this.className : "");
    this.node_2_Show =
      this.aspectRatio &&
      !(this.builderBlock?.children?.length && this.fitContent);
    this.node_3_div = {
      paddingTop: this.aspectRatio! * 100 + "%",
    };
  }

  ngOnChanges() {
    if (typeof window !== "undefined") {
      this.node_0_img = {
        objectPosition: this.backgroundPosition || "center",
        objectFit: this.backgroundSize || "cover",
        ...this.aspectRatioCss,
      };
      this.node_1_img =
        "builder-image" + (this.className ? " " + this.className : "");
      this.node_2_Show =
        this.aspectRatio &&
        !(this.builderBlock?.children?.length && this.fitContent);
      this.node_3_div = {
        paddingTop: this.aspectRatio! * 100 + "%",
      };
    }
  }
}
