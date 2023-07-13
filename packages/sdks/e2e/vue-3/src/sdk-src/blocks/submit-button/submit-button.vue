<template>
  <button
    type="submit"
    v-bind="filterAttrs(attributes, false)"
    v-on="filterAttrs(attributes, true)"
  >
    {{ text }}
  </button>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export interface ButtonProps {
  attributes?: any;
  text?: string;
}

export default defineComponent({
  name: "builder-submit-button",

  props: ["attributes", "text"],

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
  },
});
</script>