<template>
  <component v-html="styles" :id="id" :is="'style'"></component>
</template>

<script lang="ts">
import { defineComponent } from "vue";

interface Props {
  styles: string;
  id?: string;
}

export default defineComponent({
  name: "render-inlined-styles",

  props: ["styles", "id"],
});
</script>