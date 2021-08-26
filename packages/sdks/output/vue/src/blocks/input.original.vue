<template>
  <input
    v-bind="attributes"
    :key="Builder.isEditing && defaultValue ? defaultValue : 'default-key'"
    :placeholder="placeholder"
    :type="type"
    :name="name"
    :value="value"
    :defaultValue="defaultValue"
    :required="required"
  />
</template>
<script>
import { Builder } from "@builder.io/sdk";

export default {
  name: "FormInputComponent",

  props: [
    "attributes",
    "defaultValue",
    "placeholder",
    "type",
    "name",
    "value",
    "required",
  ],

  data: () => ({ Builder }),
};
</script>
