<script lang="ts">
import { defineComponent } from 'vue';
import { Content } from './src';

export default defineComponent({
  name: 'DynamicallyRenderBuilderPage',
  components: {
    'builder-render-content': Content,
  },
  props: ['props'],
});
</script>

<template>
  <builder-render-content v-bind="props" />
</template>
