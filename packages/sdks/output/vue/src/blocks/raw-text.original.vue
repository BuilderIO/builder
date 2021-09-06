<template>
  <span
    :class="
      _classStringToObject(this.attributes?.class || this.attributes?.className)
    "
    v-html="text || ''"
  ></span>
</template>
<script>
export default {
  name: "raw-text",

  props: ["attributes", "text"],

  methods: {
    _classStringToObject(str) {
      const obj = {};
      if (typeof str !== "string") {
        return obj;
      }
      const classNames = str.trim().split(/\s+/);
      for (const name of classNames) {
        obj[name] = true;
      }
      return obj;
    },
  },
};
</script>
