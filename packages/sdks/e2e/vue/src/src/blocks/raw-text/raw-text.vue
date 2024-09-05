<template>
  <div v-html="text?.toString() || ''" :class="attributes.class"></div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export interface RawTextProps {
  attributes?: any;
  text?: string;
}

export default defineComponent({
  name: "builder-raw-text",

  props: ["text", "attributes"],
});
</script>