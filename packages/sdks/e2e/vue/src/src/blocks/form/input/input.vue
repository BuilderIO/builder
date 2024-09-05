<template>
  <input
    :key="isEditing() && defaultValue ? defaultValue : 'default-key'"
    :placeholder="placeholder"
    :type="type"
    :name="name"
    :value="value"
    :defaultValue="defaultValue"
    :required="required"
    v-bind="filterAttrs(attributes, 'v-on:', false)"
    v-on="filterAttrs(attributes, 'v-on:', true)"
  />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { isEditing } from "../../../functions/is-editing";
import { filterAttrs } from "../../helpers";
import { setAttrs } from "../../helpers";

/**
 * This import is used by the Svelte SDK. Do not remove.
 */

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
    "attributes",
    "defaultValue",
    "placeholder",
    "type",
    "name",
    "value",
    "required",
  ],

  data() {
    return { isEditing, filterAttrs };
  },
});
</script>