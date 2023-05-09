<template>
  <div v-if="props.content">
    <builder-render-content v-bind="props" />
  </div>
  <div v-else>Content not Found</div>
</template>
<script lang="ts">
import { RenderContent } from '@builder.io/sdk-vue';
import '@builder.io/sdk-vue/vue2/css';
import { getProps } from '@builder.io/sdks-e2e-tests';

export default {
  name: 'DynamicallyRenderBuilderPage',
  components: {
    'builder-render-content': RenderContent,
  },
  computed: {
    props() {
      return getProps();
    },
  },
};
</script>
