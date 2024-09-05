<template>
  <div
    :class="className"
    v-bind="{ ...filterAttrs(attributes, 'v-on:', false), ...{} }"
    v-on="filterAttrs(attributes, 'v-on:', true)"
  >
    <ContentVariants
      :nonce="builderContext.nonce"
      :isNestedRender="true"
      :apiVersion="builderContext.apiVersion"
      :apiKey="builderContext.apiKey"
      :context="{
        ...builderContext.context,
        symbolId: builderBlock?.id,
      }"
      :customComponents="Object.values(builderComponents)"
      :data="{
        ...symbol?.data,
        ...builderContext.localState,
        ...contentToUse?.data?.state,
      }"
      :canTrack="builderContext.canTrack"
      :model="symbol?.model"
      :content="contentToUse"
      :linkComponent="builderLinkComponent"
      :blocksWrapper="blocksWrapper"
      :contentWrapper="contentWrapper"
    ></ContentVariants>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import ContentVariants from "../../components/content-variants/index";
import type { BuilderContent } from "../../types/builder-content";
import { filterAttrs } from "../helpers";
import DynamicDiv from "../../components/dynamic-div.vue";
import { getClassPropName } from "../../functions/get-class-prop-name";
import type { Nullable } from "../../types/typescript";
import { setAttrs } from "../helpers";
import { fetchSymbolContent } from "./symbol.helpers";
import type { SymbolProps } from "./symbol.types";

export default defineComponent({
  name: "builder-symbol",
  components: { ContentVariants: ContentVariants, DynamicDiv: DynamicDiv },
  props: [
    "symbol",
    "attributes",
    "dynamic",
    "builderContext",
    "builderBlock",
    "builderComponents",
    "builderLinkComponent",
  ],

  data() {
    return { contentToUse: this.symbol?.content, filterAttrs };
  },

  mounted() {
    this.setContent();
  },

  watch: {
    onUpdateHook0: {
      handler() {
        this.setContent();
      },
      immediate: true,
    },
  },

  computed: {
    blocksWrapper() {
      return "div";
    },
    contentWrapper() {
      return "div";
    },
    className() {
      return [
        ...[this.attributes[getClassPropName()]],
        "builder-symbol",
        this.symbol?.inline ? "builder-inline-symbol" : undefined,
        this.symbol?.dynamic || this.dynamic
          ? "builder-dynamic-symbol"
          : undefined,
      ]
        .filter(Boolean)
        .join(" ");
    },
    onUpdateHook0() {
      return {
        0: this.symbol,
      };
    },
  },

  methods: {
    setContent() {
      if (this.contentToUse) return;
      fetchSymbolContent({
        symbol: this.symbol,
        builderContextValue: this.builderContext,
      }).then((newContent) => {
        if (newContent) {
          this.contentToUse = newContent;
        }
      });
    },
  },
});
</script>