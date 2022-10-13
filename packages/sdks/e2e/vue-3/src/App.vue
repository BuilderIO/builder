<script lang="ts">
import { RenderContent } from '@builder.io/sdk-vue/vue3';
import '@builder.io/sdk-vue/vue3/css';
import { getContentForPathname } from '@builder.io/sdks-e2e-tests';

export default {
  name: 'DynamicallyRenderBuilderPage',
  components: {
    'builder-render-content': RenderContent,
  },
  computed: {
    content(): any {
      return getContentForPathname();
    },
  },
};
</script>

<template>
  <div v-if="content">
    <builder-render-content model="page" :content="content" />
  </div>
  <div v-else>Content not Found</div>
</template>
