<script lang="ts">
import { defineComponent } from 'vue';
import { Content } from '@builder.io/sdk-vue';

export default defineComponent({
  name: 'DynamicallyRenderBuilderPage',
  components: {
    'builder-render-content': Content,
  },
  props: ['props'],
});
</script>

<template>
  <div v-if="props?.content">
    <builder-render-content v-bind="props" />
  </div>
  <div v-else>Content not Found</div>
</template>
