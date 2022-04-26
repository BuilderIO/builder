<template>
  <input
    v-bind="attributes"
    :key="isEditing() && defaultValue ? defaultValue : 'default-key'"
    :placeholder="placeholder"
    :type="type"
    :name="name"
    :value="value"
    :defaultValue="defaultValue"
    :required="required"
  />
</template>
<script>
import { isEditing } from "../functions/is-editing";

export default {
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

  data: () => ({ isEditing }),
};
</script>
