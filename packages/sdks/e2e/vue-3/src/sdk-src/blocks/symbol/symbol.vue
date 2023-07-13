<template>
  <div
    :dataSet="{
      class: className,
    }"
    :class="_classStringToObject(className)"
    v-bind="filterAttrs(attributes, false)"
    v-on="filterAttrs(attributes, true)"
  >
    <render-content
      :apiVersion="builderContext.apiVersion"
      :apiKey="builderContext.apiKey"
      :context="builderContext.context"
      :customComponents="Object.values(builderContext.registeredComponents)"
      :data="{
        ...symbol?.data,
        ...builderContext.localState,
        ...contentToUse?.data?.state,
      }"
      :model="symbol?.model"
      :content="contentToUse"
    ></render-content>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import RenderContent from "../../components/render-content/render-content.vue";
import BuilderContext from "../../context/builder.context.js";
import { getContent } from "../../functions/get-content/index.js";
import type { BuilderContent } from "../../types/builder-content.js";
import type { BuilderBlock } from "../../types/builder-block.js";
import { TARGET } from "../../constants/target";
import { logger } from "../../helpers/logger";

export interface SymbolInfo {
  model?: string;
  entry?: string;
  data?: any;
  content?: BuilderContent;
  inline?: boolean;
  dynamic?: boolean;
}
export interface SymbolProps {
  symbol?: SymbolInfo;
  dataOnly?: boolean;
  dynamic?: boolean;
  builderBlock?: BuilderBlock;
  attributes?: any;
  inheritState?: boolean;
}

export default defineComponent({
  name: "builder-symbol",
  components: { RenderContent: RenderContent },
  props: ["attributes", "symbol", "dynamic"],

  data() {
    return {
      className: [
        ...(TARGET === "vue2" || TARGET === "vue3"
          ? Object.keys(this.attributes.class)
          : [this.attributes.class]),
        "builder-symbol",
        this.symbol?.inline ? "builder-inline-symbol" : undefined,
        this.symbol?.dynamic || this.dynamic
          ? "builder-dynamic-symbol"
          : undefined,
      ]
        .filter(Boolean)
        .join(" "),
      contentToUse: this.symbol?.content,
    };
  },

  inject: {
    builderContext: BuilderContext.key,
  },

  mounted() {
    this.fetchContent();
  },

  watch: {
    onUpdateHook0: {
      handler() {
        this.fetchContent();
      },
      immediate: true,
    },
  },

  computed: {
    onUpdateHook0() {
      return {
        0: this.symbol,
      };
    },
  },

  methods: {
    fetchContent() {
      /**
       * If:
       * - we have a symbol prop
       * - yet it does not have any content
       * - and we have not already stored content from before
       * - and it has a model name
       *
       * then we want to re-fetch the symbol content.
       */
      if (
        !this.contentToUse &&
        this.symbol?.model &&
        // This is a hack, we should not need to check for this, but it is needed for Svelte.
        this.builderContext?.apiKey
      ) {
        getContent({
          model: this.symbol.model,
          apiKey: this.builderContext.apiKey,
          apiVersion: this.builderContext.apiVersion,
          query: {
            id: this.symbol.entry,
          },
        })
          .then((response) => {
            if (response) {
              this.contentToUse = response;
            }
          })
          .catch((err) => {
            logger.error("Could not fetch symbol content: ", err);
          });
      }
    },
    filterAttrs: function filterAttrs(attrs = {}, isEvent) {
      const eventPrefix = "v-on:";
      return Object.keys(attrs)
        .filter((attr) => {
          if (!attrs[attr]) {
            return false;
          }
          const isEventVal = attr.startsWith(eventPrefix);
          return isEvent ? isEventVal : !isEventVal;
        })
        .reduce(
          (acc, attr) => ({
            ...acc,
            [attr.replace(eventPrefix, "")]: attrs[attr],
          }),
          {}
        );
    },
    _classStringToObject(str: string) {
      const obj: Record<string, boolean> = {};
      if (typeof str !== "string") {
        return obj;
      }
      const classNames = str.trim().split(/\s+/);
      for (const name of classNames) {
        obj[name] = true;
      }
      return obj;
    },
  },
});
</script>