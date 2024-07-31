import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

import { getDefaultRegisteredComponents } from "../../constants/builder-registered-components";
import { TARGET } from "../../constants/target";
import ComponentsContext from "../../context/components.context";
import type {
  BuilderContextInterface,
  BuilderRenderState,
  RegisteredComponents,
} from "../../context/types";
import { serializeComponentInfo } from "../../functions/register-component";
import type { ComponentInfo } from "../../types/components";
import type { Dictionary } from "../../types/typescript";
import Blocks from "../blocks/blocks";
import { getUpdateVariantVisibilityScript } from "../content-variants/helpers";
import DynamicDiv from "../dynamic-div";
import InlinedScript from "../inlined-script";
import EnableEditor from "./components/enable-editor";
import ContentStyles from "./components/styles";
import {
  getContentInitialValue,
  getRootStateInitialValue,
} from "./content.helpers";
import type { ContentProps } from "./content.types";
import { wrapComponentRef } from "./wrap-component-ref";

@Component({
  selector: "content-component, ContentComponent",
  template: `
    <enable-editor
      [nonce]="nonce"
      [content]="content"
      [data]="data"
      [model]="model"
      [context]="context"
      [apiKey]="apiKey"
      [canTrack]="canTrack"
      [locale]="locale"
      [enrich]="enrich"
      [showContent]="showContent"
      [builderContextSignal]="builderContextSignal"
      [contentWrapper]="contentWrapper"
      [contentWrapperProps]="contentWrapperProps"
      [trustedHosts]="trustedHosts"
    >
      <ng-container *ngIf="isSsrAbTest">
        <inlined-script
          id="builderio-variant-visibility"
          [scriptStr]="scriptStr"
          [nonce]="nonce || ''"
        ></inlined-script>
      </ng-container>
      <ng-container *ngIf="TARGET !== 'reactNative'">
        <content-styles
          [nonce]="nonce || ''"
          [isNestedRender]="isNestedRender"
          [contentId]="builderContextSignal.content?.id"
          [cssCode]="builderContextSignal.content?.data?.cssCode"
          [customFonts]="builderContextSignal.content?.data?.customFonts"
        ></content-styles>
      </ng-container>
      <blocks
        [blocks]="builderContextSignal.content?.data?.blocks"
        [context]="builderContextSignal"
        [registeredComponents]="registeredComponents"
        [linkComponent]="linkComponent"
      ></blocks>
    </enable-editor>
  `,
  styles: [
    `
      :host {
        display: contents;
      }
    `,
  ],
  standalone: true,
  imports: [CommonModule, EnableEditor, InlinedScript, ContentStyles, Blocks],
})
export default class ContentComponent {
  TARGET = TARGET;

  @Input() content!: ContentProps["content"];
  @Input() data!: ContentProps["data"];
  @Input() locale!: ContentProps["locale"];
  @Input() context!: ContentProps["context"];
  @Input() canTrack!: ContentProps["canTrack"];
  @Input() apiKey!: ContentProps["apiKey"];
  @Input() apiVersion!: ContentProps["apiVersion"];
  @Input() customComponents!: ContentProps["customComponents"];
  @Input() model!: ContentProps["model"];
  @Input() blocksWrapper!: ContentProps["blocksWrapper"];
  @Input() blocksWrapperProps!: ContentProps["blocksWrapperProps"];
  @Input() nonce!: ContentProps["nonce"];
  @Input() enrich!: ContentProps["enrich"];
  @Input() showContent!: ContentProps["showContent"];
  @Input() contentWrapper!: ContentProps["contentWrapper"];
  @Input() contentWrapperProps!: ContentProps["contentWrapperProps"];
  @Input() trustedHosts!: ContentProps["trustedHosts"];
  @Input() isSsrAbTest!: ContentProps["isSsrAbTest"];
  @Input() isNestedRender!: ContentProps["isNestedRender"];
  @Input() linkComponent!: ContentProps["linkComponent"];

  scriptStr = getUpdateVariantVisibilityScript({
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
    variationId: this.content?.testVariationId!,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
    contentId: this.content?.id!,
  });
  contentSetState(newRootState: BuilderRenderState) {
    this.builderContextSignal.rootState = newRootState;
  }
  registeredComponents = [
    ...getDefaultRegisteredComponents(),
    ...(this.customComponents?.filter(({ models }) => {
      if (!models?.length) return true;
      if (!this.model) return true;
      return models.includes(this.model);
    }) || []),
  ].reduce<RegisteredComponents>(
    (acc, { component, ...info }) => ({
      ...acc,
      [info.name]: {
        component: component,
        ...serializeComponentInfo(info),
      },
    }),
    {}
  );
  builderContextSignal = {
    content: getContentInitialValue({
      content: this.content,
      data: this.data,
    }),
    localState: undefined,
    rootState: getRootStateInitialValue({
      content: this.content,
      data: this.data,
      locale: this.locale,
    }),
    rootSetState: this.contentSetState.bind(this),
    context: this.context || {},
    canTrack: this.canTrack,
    apiKey: this.apiKey,
    apiVersion: this.apiVersion,
    componentInfos: [
      ...getDefaultRegisteredComponents(),
      ...(this.customComponents?.filter(({ models }) => {
        if (!models?.length) return true;
        if (!this.model) return true;
        return models.includes(this.model);
      }) || []),
    ].reduce<Dictionary<ComponentInfo>>(
      (acc, { component: _, ...info }) => ({
        ...acc,
        [info.name]: serializeComponentInfo(info),
      }),
      {}
    ),
    inheritedStyles: {},
    BlocksWrapper: this.blocksWrapper || DynamicDiv,
    BlocksWrapperProps: this.blocksWrapperProps || {},
    nonce: this.nonce || "",
  };

  ngOnInit() {
    this.builderContextSignal = {
      content: getContentInitialValue({
        content: this.content,
        data: this.data,
      }),
      localState: undefined,
      rootState: getRootStateInitialValue({
        content: this.content,
        data: this.data,
        locale: this.locale,
      }),
      rootSetState: this.contentSetState.bind(this),
      context: this.context || {},
      canTrack: this.canTrack,
      apiKey: this.apiKey,
      apiVersion: this.apiVersion,
      componentInfos: [
        ...getDefaultRegisteredComponents(),
        ...(this.customComponents?.filter(({ models }) => {
          if (!models?.length) return true;
          if (!this.model) return true;
          return models.includes(this.model);
        }) || []),
      ].reduce<Dictionary<ComponentInfo>>(
        (acc, { component: _, ...info }) => ({
          ...acc,
          [info.name]: serializeComponentInfo(info),
        }),
        {}
      ),
      inheritedStyles: {},
      BlocksWrapper: this.blocksWrapper || DynamicDiv,
      BlocksWrapperProps: this.blocksWrapperProps || {},
      nonce: this.nonce || "",
    };
    this.registeredComponents = [
      ...getDefaultRegisteredComponents(),
      ...(this.customComponents?.filter(({ models }) => {
        if (!models?.length) return true;
        if (!this.model) return true;
        return models.includes(this.model);
      }) || []),
    ].reduce<RegisteredComponents>(
      (acc, { component, ...info }) => ({
        ...acc,
        [info.name]: {
          component: component,
          ...serializeComponentInfo(info),
        },
      }),
      {}
    );
  }
}
