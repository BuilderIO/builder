<template>
  <section
    :style="{
      width: '100%',
      alignSelf: 'stretch',
      flexGrow: 1,
      boxSizing: 'border-box',
      maxWidth: maxWidth || 1200,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      marginLeft: 'auto',
      marginRight: 'auto',
    }"
    v-bind="filterAttrs(attributes, false)"
    v-on="filterAttrs(attributes, true)"
  >
    <slot />
  </section>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export interface SectionProps {
  maxWidth?: number;
  attributes?: any;
  children?: any;
  builderBlock?: any;
}

export default defineComponent({
  name: "builder-section-component",

  props: ["maxWidth", "attributes"],

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