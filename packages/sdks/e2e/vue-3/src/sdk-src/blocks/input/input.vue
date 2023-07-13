<template>
  <input
    :key="isEditing() && defaultValue ? defaultValue : 'default-key'"
    :placeholder="placeholder"
    :type="type"
    :name="name"
    :value="value"
    :defaultValue="defaultValue"
    :required="required"
    v-bind="filterAttrs(attributes, false)"
    v-on="filterAttrs(attributes, true)"
  />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { isEditing } from "../../functions/is-editing.js";

export interface FormInputProps {
  type?: string;
  attributes?: any;
  name?: string;
  value?: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
}

export default defineComponent({
  name: "builder-form-input-component",

  props: [
    "defaultValue",
    "placeholder",
    "type",
    "name",
    "value",
    "required",
    "attributes",
  ],

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