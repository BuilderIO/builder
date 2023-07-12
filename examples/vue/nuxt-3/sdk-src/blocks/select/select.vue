<template>
  <select
    :value="value"
    :key="isEditing() && defaultValue ? defaultValue : 'default-key'"
    :defaultValue="defaultValue"
    :name="name"
    v-bind="filterAttrs(attributes, false)"
    v-on="filterAttrs(attributes, true)"
  >
    <template :key="index" v-for="(option, index) in options">
      <option :value="option.value">{{ option.name || option.value }}</option>
    </template>
  </select>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { isEditing } from "../../functions/is-editing.js";

export interface FormSelectProps {
  options?: {
    name?: string;
    value: string;
  }[];
  attributes?: any;
  name?: string;
  value?: string;
  defaultValue?: string;
}

export default defineComponent({
  name: "builder-select-component",

  props: ["value", "defaultValue", "name", "attributes", "options"],

  data() {
    return { isEditing };
  },

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