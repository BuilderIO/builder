import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

type VariantsProviderProps = ContentVariantsPrps & {
  /**
   * For internal use only. Do not provide this prop.
   */
  isNestedRender?: boolean;
};

import { TARGET } from "../../constants/target";
import { handleABTestingSync } from "../../helpers/ab-tests";
import { getDefaultCanTrack } from "../../helpers/canTrack";
import ContentComponent from "../content/content";
import InlinedScript from "../inlined-script";
import InlinedStyles from "../inlined-styles";
import type { ContentVariantsPrps } from "./content-variants.types";
import {
  checkShouldRenderVariants,
  getInitVariantsFnsScriptString,
  getUpdateCookieAndStylesScript,
  getVariants,
} from "./helpers";

@Component({
  selector: "content-variants, ContentVariants",
  template: `
    <ng-container>
      <ng-container *ngIf="!isNestedRender && TARGET !== 'reactNative'">
        <InlinedScript
          id="builderio-init-variants-fns"
          [scriptStr]="node_0_InlinedScript"
          [nonce]="nonce || ''"
        ></InlinedScript>
      </ng-container>
      <ng-container *ngIf="shouldRenderVariants">
        <InlinedStyles
          id="builderio-variants"
          [styles]="hideVariantsStyleString"
          [nonce]="nonce || ''"
        ></InlinedStyles>
        <InlinedScript
          id="builderio-variants-visibility"
          [scriptStr]="updateCookieAndStylesScriptStr"
          [nonce]="nonce || ''"
        ></InlinedScript>
        <ng-container
          *ngFor="let variant of getVariants(content); trackBy: trackByVariant0"
        >
          <ContentComponent
            [isNestedRender]="isNestedRender"
            [nonce]="nonce"
            [content]="variant"
            [showContent]="false"
            [model]="model"
            [data]="data"
            [context]="context"
            [apiKey]="apiKey"
            [apiVersion]="apiVersion"
            [customComponents]="customComponents"
            [linkComponent]="linkComponent"
            [canTrack]="canTrack"
            [locale]="locale"
            [enrich]="enrich"
            [isSsrAbTest]="shouldRenderVariants"
            [blocksWrapper]="blocksWrapper"
            [blocksWrapperProps]="blocksWrapperProps"
            [contentWrapper]="contentWrapper"
            [contentWrapperProps]="contentWrapperProps"
            [trustedHosts]="trustedHosts"
          ></ContentComponent>
        </ng-container>
      </ng-container>
      <ContentComponent
        [nonce]="nonce"
        [isNestedRender]="isNestedRender"
        [content]="defaultContent"
        [showContent]="true"
        [model]="model"
        [data]="data"
        [context]="context"
        [apiKey]="apiKey"
        [apiVersion]="apiVersion"
        [customComponents]="customComponents"
        [linkComponent]="linkComponent"
        [canTrack]="canTrack"
        [locale]="locale"
        [enrich]="enrich"
        [isSsrAbTest]="shouldRenderVariants"
        [blocksWrapper]="blocksWrapper"
        [blocksWrapperProps]="blocksWrapperProps"
        [contentWrapper]="contentWrapper"
        [contentWrapperProps]="contentWrapperProps"
        [trustedHosts]="trustedHosts"
      ></ContentComponent>
    </ng-container>
  `,
  styles: [
    `
      :host {
        display: contents;
      }
    `,
  ],
  standalone: true,
  imports: [CommonModule, InlinedScript, InlinedStyles, ContentComponent],
})
export default class ContentVariants {
  TARGET = TARGET;
  getVariants = getVariants;

  @Input() canTrack!: VariantsProviderProps["canTrack"];
  @Input() content!: VariantsProviderProps["content"];
  @Input() isNestedRender!: VariantsProviderProps["isNestedRender"];
  @Input() nonce!: VariantsProviderProps["nonce"];
  @Input() model!: VariantsProviderProps["model"];
  @Input() data!: VariantsProviderProps["data"];
  @Input() context!: VariantsProviderProps["context"];
  @Input() apiKey!: VariantsProviderProps["apiKey"];
  @Input() apiVersion!: VariantsProviderProps["apiVersion"];
  @Input() customComponents!: VariantsProviderProps["customComponents"];
  @Input() linkComponent!: VariantsProviderProps["linkComponent"];
  @Input() locale!: VariantsProviderProps["locale"];
  @Input() enrich!: VariantsProviderProps["enrich"];
  @Input() blocksWrapper!: VariantsProviderProps["blocksWrapper"];
  @Input() blocksWrapperProps!: VariantsProviderProps["blocksWrapperProps"];
  @Input() contentWrapper!: VariantsProviderProps["contentWrapper"];
  @Input() contentWrapperProps!: VariantsProviderProps["contentWrapperProps"];
  @Input() trustedHosts!: VariantsProviderProps["trustedHosts"];

  shouldRenderVariants = checkShouldRenderVariants({
    canTrack: getDefaultCanTrack(this.canTrack),
    content: this.content,
  });
  get updateCookieAndStylesScriptStr() {
    return getUpdateCookieAndStylesScript(
      getVariants(this.content).map((value) => ({
        id: value.testVariationId!,
        testRatio: value.testRatio,
      })),
      this.content?.id || ""
    );
  }
  get hideVariantsStyleString() {
    return getVariants(this.content)
      .map((value) => `.variant-${value.testVariationId} { display: none; } `)
      .join("");
  }
  get defaultContent() {
    return this.shouldRenderVariants
      ? {
          ...this.content,
          testVariationId: this.content?.id,
        }
      : handleABTestingSync({
          item: this.content,
          canTrack: getDefaultCanTrack(this.canTrack),
        });
  }
  node_0_InlinedScript = null;
  trackByVariant0(_, variant) {
    return variant.testVariationId;
  }

  ngOnInit() {
    this.shouldRenderVariants = checkShouldRenderVariants({
      canTrack: getDefaultCanTrack(this.canTrack),
      content: this.content,
    });
    this.node_0_InlinedScript = getInitVariantsFnsScriptString();

    if (typeof window !== "undefined") {
      /**
       * For Solid/Svelte: we unmount the non-winning variants post-hydration.
       */
    }
  }

  ngOnChanges() {
    if (typeof window !== "undefined") {
      this.node_0_InlinedScript = getInitVariantsFnsScriptString();
    }
  }
}
