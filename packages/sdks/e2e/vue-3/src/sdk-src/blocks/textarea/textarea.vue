<template>
  <textarea
    :placeholder="placeholder"
    :name="name"
    :value="value"
    :defaultValue="defaultValue"
    v-bind="filterAttrs(attributes, false)"
    v-on="filterAttrs(attributes, true)"
  ></textarea>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export interface TextareaProps {
  attributes?: any;
  name?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
}

export default defineComponent({
  name: "builder-textarea",

  props: ["placeholder", "name", "value", "defaultValue", "attributes"],

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