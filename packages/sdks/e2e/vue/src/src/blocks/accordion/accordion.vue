<template>
  <div class="builder-accordion" :style="accordionStyles">
    <template :key="index" v-for="(item, index) in items">
      <div
        :class="getAccordionTitleClassName(index)"
        :style="{
          ...accordionTitleStyles,
          width: grid ? gridRowWidth : undefined,
          ...{
            order:
              openGridItemOrder !== null
                ? convertOrderNumberToString(index)
                : convertOrderNumberToString(index + 1),
          },
        }"
        :data-index="index"
        @click="onClick(index)"
      >
        <Blocks
          :blocks="item.title"
          :path="`items.${index}.title`"
          :parent="builderBlock.id"
          :context="builderContext"
          :registeredComponents="builderComponents"
          :linkComponent="builderLinkComponent"
        ></Blocks>
      </div>

      <template v-if="open.includes(index)">
        <div
          :class="getAccordionDetailClassName(index)"
          :style="accordionDetailStyles"
        >
          <Blocks
            :blocks="item.detail"
            :path="`items.${index}.detail`"
            :parent="builderBlock.id"
            :context="builderContext"
            :registeredComponents="builderComponents"
            :linkComponent="builderLinkComponent"
          ></Blocks>
        </div>
      </template>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import Blocks from "../../components/blocks/index";
import { camelToKebabCase } from "../../functions/camel-to-kebab-case";
import type { Dictionary } from "../../types/typescript";
import type { AccordionProps } from "./accordion.types";
import { convertOrderNumberToString } from "./helpers";

export default defineComponent({
  name: "builder-accordion",
  components: { Blocks: Blocks },
  props: [
    "grid",
    "oneAtATime",
    "items",
    "gridRowWidth",
    "builderBlock",
    "builderContext",
    "builderComponents",
    "builderLinkComponent",
  ],

  data() {
    return { open: [], convertOrderNumberToString };
  },

  computed: {
    onlyOneAtATime() {
      return Boolean(this.grid || this.oneAtATime);
    },
    accordionStyles() {
      const styles = {
        display: "flex" as "flex" | "none",
        alignItems: "stretch" as
          | "stretch"
          | "flex-start"
          | "flex-end"
          | "center"
          | "baseline",
        flexDirection: "column" as
          | "column"
          | "row"
          | "column-reverse"
          | "row-reverse",
        ...(this.grid && {
          flexDirection: "row" as
            | "column"
            | "row"
            | "column-reverse"
            | "row-reverse",
          alignItems: "flex-start" as
            | "stretch"
            | "flex-start"
            | "flex-end"
            | "center"
            | "baseline",
          flexWrap: "wrap" as "nowrap" | "wrap",
        }),
      };
      return styles;
    },
    accordionTitleStyles() {
      const shared = {
        display: "flex",
        flexDirection: "column",
      };
      const styles = {
        ...shared,
        alignItems: "stretch",
        cursor: "pointer",
      };
      return Object.fromEntries(
        Object.entries(styles).filter(([_, value]) => value !== undefined)
      ) as Dictionary<string>;
    },
    openGridItemOrder() {
      let itemOrder: number | null = null;
      const getOpenGridItemPosition = this.grid && this.open.length;
      if (getOpenGridItemPosition && document) {
        const openItemIndex = this.open[0];
        const openItem = document.querySelector(
          `.builder-accordion-title[data-index="${openItemIndex}"]`
        );
        let subjectItem = openItem;
        itemOrder = openItemIndex;
        if (subjectItem) {
          let prevItemRect = subjectItem.getBoundingClientRect();
          while (
            (subjectItem = subjectItem && subjectItem.nextElementSibling)
          ) {
            if (subjectItem) {
              if (subjectItem.classList.contains("builder-accordion-detail")) {
                continue;
              }
              const subjectItemRect = subjectItem.getBoundingClientRect();
              if (subjectItemRect.left > prevItemRect.left) {
                const index = parseInt(
                  subjectItem.getAttribute("data-index") || "",
                  10
                );
                if (!isNaN(index)) {
                  prevItemRect = subjectItemRect;
                  itemOrder = index;
                }
              } else {
                break;
              }
            }
          }
        }
      }
      if (typeof itemOrder === "number") {
        itemOrder = itemOrder + 1;
      }
      return itemOrder;
    },
    accordionDetailStyles() {
      const styles = {
        ...{
          order:
            typeof this.openGridItemOrder === "number"
              ? (this.openGridItemOrder as number)
              : undefined,
        },
        ...(this.grid && {
          width: "100%",
        }),
      };
      return Object.fromEntries(
        Object.entries(styles).filter(([_, value]) => value !== undefined)
      ) as Dictionary<string>;
    },
  },

  methods: {
    getAccordionTitleClassName(index: number) {
      return `builder-accordion-title builder-accordion-title-${
        this.open.includes(index) ? "open" : "closed"
      }`;
    },
    getAccordionDetailClassName(index: number) {
      return `builder-accordion-detail builder-accordion-detail-${
        this.open.includes(index) ? "open" : "closed"
      }`;
    },
    onClick(index: number) {
      if (this.open.includes(index)) {
        this.open = this.onlyOneAtATime
          ? []
          : this.open.filter((item) => item !== index);
      } else {
        this.open = this.onlyOneAtATime ? [index] : this.open.concat(index);
      }
    },
  },
});
</script>