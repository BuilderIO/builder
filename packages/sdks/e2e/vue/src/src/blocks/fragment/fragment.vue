<template>
  <span><slot /></span>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import type { FragmentProps } from "./fragment.types";

export default defineComponent({
  name: "builder-fragment-component",

  props: [],
});
</script>