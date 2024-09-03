<template>
  <EnableEditor
    :nonce="nonce"
    :content="content"
    :data="data"
    :model="model"
    :context="context"
    :apiKey="apiKey"
    :canTrack="canTrack"
    :locale="locale"
    :enrich="enrich"
    :showContent="showContent"
    :builderContextSignal="builderContextSignal"
    :contentWrapper="contentWrapper"
    :contentWrapperProps="contentWrapperProps"
    :trustedHosts="trustedHosts"
    v-bind="{}"
  >
    <template v-if="isSsrAbTest">
      <InlinedScript
        id="builderio-variant-visibility"
        :scriptStr="scriptStr"
        :nonce="nonce || ''"
      ></InlinedScript>
    </template>

    <template v-if="TARGET !== 'reactNative'">
      <ContentStyles
        :nonce="nonce || ''"
        :isNestedRender="isNestedRender"
        :contentId="builderContextSignal.content?.id"
        :cssCode="builderContextSignal.content?.data?.cssCode"
        :customFonts="builderContextSignal.content?.data?.customFonts"
      ></ContentStyles>
    </template>

    <Blocks
      :blocks="builderContextSignal.content?.data?.blocks"
      :context="builderContextSignal"
      :registeredComponents="registeredComponents"
      :linkComponent="linkComponent"
    ></Blocks
  ></EnableEditor>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { getDefaultRegisteredComponents } from "../../constants/builder-registered-components";
import { TARGET } from "../../constants/target";
import ComponentsContext from "../../context/components.context";
import type {
  BuilderContextInterface,
  BuilderRenderState,
  RegisteredComponents,
} from "../../context/types";
import { serializeIncludingFunctions } from "../../functions/register-component";
import type { ComponentInfo } from "../../types/components";
import type { Dictionary } from "../../types/typescript";
import Blocks from "../blocks/blocks.vue";
import { getUpdateVariantVisibilityScript } from "../content-variants/helpers";
import DynamicDiv from "../dynamic-div.vue";
import InlinedScript from "../inlined-script.vue";
import EnableEditor from "./components/enable-editor.vue";
import ContentStyles from "./components/styles.vue";
import {
  getContentInitialValue,
  getRootStateInitialValue,
} from "./content.helpers";
import type { ContentProps } from "./content.types";
import { wrapComponentRef } from "./wrap-component-ref";

export default defineComponent({
  name: "content-component",
  components: {
    EnableEditor: EnableEditor,
    InlinedScript: InlinedScript,
    ContentStyles: ContentStyles,
    Blocks: Blocks,
    DynamicDiv: DynamicDiv,
  },
  props: [
    "content",
    "customComponents",
    "model",
    "data",
    "locale",
    "context",
    "canTrack",
    "apiKey",
    "apiVersion",
    "blocksWrapper",
    "blocksWrapperProps",
    "nonce",
    "enrich",
    "showContent",
    "contentWrapper",
    "contentWrapperProps",
    "trustedHosts",
    "isSsrAbTest",
    "isNestedRender",
    "linkComponent",
  ],

  data() {
    return {
      scriptStr: getUpdateVariantVisibilityScript({
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
        variationId: this.content?.testVariationId!,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
        contentId: this.content?.id!,
      }),
      registeredComponents: [
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
            component: wrapComponentRef(component),
            ...serializeIncludingFunctions(info),
          },
        }),
        {}
      ),
      builderContextSignal: {
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
        rootSetState: this.contentSetState,
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
            [info.name]: serializeIncludingFunctions(info),
          }),
          {}
        ),
        inheritedStyles: {},
        BlocksWrapper: this.blocksWrapper || "div",
        BlocksWrapperProps: this.blocksWrapperProps || {},
        nonce: this.nonce || "",
      },
      TARGET,
    };
  },

  provide() {
    const _this = this;
    return {
      [ComponentsContext.key]: {
        registeredComponents: _this.registeredComponents,
      },
    };
  },

  methods: {
    contentSetState(newRootState: BuilderRenderState) {
      this.builderContextSignal.rootState = newRootState;
    },
  },
});
</script>