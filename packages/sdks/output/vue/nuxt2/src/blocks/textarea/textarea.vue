<template>
  <textarea
    v-bind="attributes"
    :placeholder="placeholder"
    :name="name"
    :value="value"
    :defaultValue="defaultValue"
  ></textarea>
</template>
<script>
export default {
  name: "builder-textarea",

  props: ["attributes", "placeholder", "name", "value", "defaultValue"],
};
</script>
