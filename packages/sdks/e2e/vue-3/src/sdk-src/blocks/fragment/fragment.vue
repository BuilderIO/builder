<template>
  <span><slot /></span>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export interface FragmentProps {
  maxWidth?: number;
  attributes?: any;
  children?: any;
}

export default defineComponent({
  name: "builder-fragment-component",

  props: [],
});
</script>