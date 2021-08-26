<template>
  <render-blocks path="children" :blocks="children"></render-blocks>
</template>
<script>
import RenderBlocks from "../components/render-blocks.lite";

export default {
  name: "FragmentComponent",
  components: { RenderBlocks },
  props: [],

  data: () => ({ RenderBlocks }),
};
</script>
