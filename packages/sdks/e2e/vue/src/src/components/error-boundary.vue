<template>
  <slot />
</template>

<script lang="ts">
import { defineComponent } from "vue";

export interface ErrorBoundaryProps {
  children: any;
}

export default defineComponent({
  name: "error-boundary",

  props: [],
});
</script>