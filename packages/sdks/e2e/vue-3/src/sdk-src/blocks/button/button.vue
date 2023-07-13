<template>
  <template v-if="link">
    <a
      role="button"
      :href="link"
      :target="openLinkInNewTab ? '_blank' : undefined"
      v-bind="filterAttrs(attributes, false)"
      v-on="filterAttrs(attributes, true)"
    >
      {{ text }}
    </a>
  </template>

  <template v-else>
    <button
      :class="
        _classStringToObject /** * We have to explicitly provide `class` so that Mitosis knows to merge it with `css`. */(
          attributes.class + ' button-4o9pb21oca6'
        )
      "
      v-bind="filterAttrs(attributes, false)"
      v-on="filterAttrs(attributes, true)"
    >
      {{ text }}
    </button>
  </template>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export interface ButtonProps {
  attributes?: any;
  text?: string;
  link?: string;
  openLinkInNewTab?: boolean;
}

export default defineComponent({
  name: "builder-button",

  props: ["attributes", "text", "link", "openLinkInNewTab"],

  methods: {
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

<style scoped>
.button-4o9pb21oca6 {
  all: unset;
}
</style>