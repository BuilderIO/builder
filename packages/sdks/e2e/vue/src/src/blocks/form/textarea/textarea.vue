<template>
  <textarea
    :placeholder="placeholder"
    :name="name"
    :value="value"
    :defaultValue="defaultValue"
    :required="required"
    v-bind="filterAttrs(attributes, 'v-on:', false)"
    v-on="filterAttrs(attributes, 'v-on:', true)"
  ></textarea>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { filterAttrs } from "../../helpers";
import { setAttrs } from "../../helpers";

/**
 * This import is used by the Svelte SDK. Do not remove.
 */

export interface TextareaProps {
  attributes?: any;
  name?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
}

export default defineComponent({
  name: "builder-textarea",

  props: [
    "attributes",
    "placeholder",
    "name",
    "value",
    "defaultValue",
    "required",
  ],

  data() {
    return { filterAttrs };
  },
});
</script>