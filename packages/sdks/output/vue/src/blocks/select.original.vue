<template>
  <select
    v-bind="attributes"
    :value="value"
    :key="Builder.isEditing && defaultValue ? defaultValue : 'default-key'"
    :defaultValue="defaultValue"
    :name="name"
  >
    <template :key="index" v-for="(option, index) in options">
      <option :value="option.value">{{ option.name || option.value }}</option>
    </template>
  </select>
</template>
<script>
import { Builder } from "@builder.io/sdk";

export default {
  name: "SelectComponent",

  props: ["attributes", "value", "defaultValue", "name", "options"],

  data: () => ({ Builder }),
};
</script>
