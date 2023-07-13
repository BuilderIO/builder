<template>
  <span
    :class="_classStringToObject(attributes?.class || attributes?.className)"
    v-html="text || ''"
  ></span>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export interface RawTextProps {
  attributes?: any;
  text?: string;
  // builderBlock?: any;
}

export default defineComponent({
  name: "builder-raw-text",

  props: ["attributes", "text"],

  methods: {
    _classStringToObject(str: string) {
      const obj: Record<string, boolean> = {};
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
});
</script>