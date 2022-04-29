<template>
  <select
    v-bind="attributes"
    :value="value"
    :key="isEditing() && defaultValue ? defaultValue : 'default-key'"
    :defaultValue="defaultValue"
    :name="name"
  >
    <option
      v-for="(option, index) in options"
      :value="option.value"
      :key="index"
    >
      {{ option.name || option.value }}
    </option>
  </select>
</template>
<script>
import { isEditing } from "../functions/is-editing";

export default {
  name: "builder-select-component",

  props: ["attributes", "value", "defaultValue", "name", "options"],

  data: () => ({ isEditing }),
};
</script>
