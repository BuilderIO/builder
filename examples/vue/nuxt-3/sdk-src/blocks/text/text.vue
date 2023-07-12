<template>
  <span
    class="builder-text"
    v-html="text"
    :style="{
      outline: 'none',
    }"
  ></span>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export interface TextProps {
  text: string;
}

export default defineComponent({
  name: "builder-text",

  props: ["text"],
});
</script>