<template>
  <select
    :value="value"
    :key="isEditing() && defaultValue ? defaultValue : 'default-key'"
    :defaultValue="defaultValue"
    :name="name"
    :required="required"
    v-bind="filterAttrs(attributes, 'v-on:', false)"
    v-on="filterAttrs(attributes, 'v-on:', true)"
  >
    <template
      :key="`${option.name}-${index}`"
      v-for="(option, index) in options"
    >
      <option :value="option.value">{{ option.name || option.value }}</option>
    </template>
  </select>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { isEditing } from "../../../functions/is-editing";
import { filterAttrs } from "../../helpers";
import { setAttrs } from "../../helpers";

/**
 * This import is used by the Svelte SDK. Do not remove.
 */

export interface FormSelectProps {
  options?: {
    name?: string;
    value: string;
  }[];
  attributes?: any;
  name?: string;
  value?: string;
  defaultValue?: string;
  required?: boolean;
}

export default defineComponent({
  name: "builder-select-component",

  props: ["attributes", "value", "defaultValue", "name", "required", "options"],

  data() {
    return { isEditing, filterAttrs };
  },
});
</script>