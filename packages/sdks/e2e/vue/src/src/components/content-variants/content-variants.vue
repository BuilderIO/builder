<template>
  <template v-if="!isNestedRender && TARGET !== 'reactNative'">
    <InlinedScript
      id="builderio-init-variants-fns"
      :scriptStr="getInitVariantsFnsScriptString()"
      :nonce="nonce || ''"
    ></InlinedScript>
  </template>

  <template v-if="shouldRenderVariants">
    <InlinedStyles
      id="builderio-variants"
      :styles="hideVariantsStyleString"
      :nonce="nonce || ''"
    ></InlinedStyles>
    <InlinedScript
      id="builderio-variants-visibility"
      :scriptStr="updateCookieAndStylesScriptStr"
      :nonce="nonce || ''"
    ></InlinedScript>
    <template
      :key="variant.testVariationId"
      v-for="(variant, index) in getVariants(content)"
    >
      <ContentComponent
        :isNestedRender="isNestedRender"
        :nonce="nonce"
        :content="variant"
        :showContent="false"
        :model="model"
        :data="data"
        :context="context"
        :apiKey="apiKey"
        :apiVersion="apiVersion"
        :customComponents="customComponents"
        :linkComponent="linkComponent"
        :canTrack="canTrack"
        :locale="locale"
        :enrich="enrich"
        :isSsrAbTest="shouldRenderVariants"
        :blocksWrapper="blocksWrapper"
        :blocksWrapperProps="blocksWrapperProps"
        :contentWrapper="contentWrapper"
        :contentWrapperProps="contentWrapperProps"
        :trustedHosts="trustedHosts"
        v-bind="{}"
      ></ContentComponent>
    </template>
  </template>

  <ContentComponent
    :nonce="nonce"
    :isNestedRender="isNestedRender"
    :content="defaultContent"
    :showContent="true"
    :model="model"
    :data="data"
    :context="context"
    :apiKey="apiKey"
    :apiVersion="apiVersion"
    :customComponents="customComponents"
    :linkComponent="linkComponent"
    :canTrack="canTrack"
    :locale="locale"
    :enrich="enrich"
    :isSsrAbTest="shouldRenderVariants"
    :blocksWrapper="blocksWrapper"
    :blocksWrapperProps="blocksWrapperProps"
    :contentWrapper="contentWrapper"
    :contentWrapperProps="contentWrapperProps"
    :trustedHosts="trustedHosts"
    v-bind="{
      key: shouldRenderVariants.toString(),
    }"
  ></ContentComponent>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { TARGET } from "../../constants/target";
import { handleABTestingSync } from "../../helpers/ab-tests";
import { getDefaultCanTrack } from "../../helpers/canTrack";
import ContentComponent from "../content/content.vue";
import InlinedScript from "../inlined-script.vue";
import InlinedStyles from "../inlined-styles.vue";
import type { ContentVariantsPrps } from "./content-variants.types";
import {
  checkShouldRenderVariants,
  getInitVariantsFnsScriptString,
  getUpdateCookieAndStylesScript,
  getVariants,
} from "./helpers";

type VariantsProviderProps = ContentVariantsPrps & {
  /**
   * For internal use only. Do not provide this prop.
   */
  isNestedRender?: boolean;
};

export default defineComponent({
  name: "content-variants",
  components: {
    InlinedScript: InlinedScript,
    InlinedStyles: InlinedStyles,
    ContentComponent: ContentComponent,
  },
  props: [
    "canTrack",
    "content",
    "isNestedRender",
    "nonce",
    "model",
    "data",
    "context",
    "apiKey",
    "apiVersion",
    "customComponents",
    "linkComponent",
    "locale",
    "enrich",
    "blocksWrapper",
    "blocksWrapperProps",
    "contentWrapper",
    "contentWrapperProps",
    "trustedHosts",
  ],

  data() {
    return {
      shouldRenderVariants: checkShouldRenderVariants({
        canTrack: getDefaultCanTrack(this.canTrack),
        content: this.content,
      }),
      TARGET,
      getInitVariantsFnsScriptString,
      getVariants,
    };
  },

  mounted() {
    /**
     * For Solid/Svelte: we unmount the non-winning variants post-hydration.
     */
  },

  computed: {
    updateCookieAndStylesScriptStr() {
      return getUpdateCookieAndStylesScript(
        getVariants(this.content).map((value) => ({
          id: value.testVariationId!,
          testRatio: value.testRatio,
        })),
        this.content?.id || ""
      );
    },
    hideVariantsStyleString() {
      return getVariants(this.content)
        .map((value) => `.variant-${value.testVariationId} { display: none; } `)
        .join("");
    },
    defaultContent() {
      return this.shouldRenderVariants
        ? {
            ...this.content,
            testVariationId: this.content?.id,
          }
        : handleABTestingSync({
            item: this.content,
            canTrack: getDefaultCanTrack(this.canTrack),
          });
    },
  },
});
</script>