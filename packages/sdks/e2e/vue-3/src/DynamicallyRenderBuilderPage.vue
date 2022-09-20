vue3-debug
<template>
  <div v-if="content">
    <builder-render-content model="page" :content="content" />
  </div>
  <div v-else>Content not Found</div>
</template>
<script>
import { RenderContent } from '@builder.io/sdk-vue/vue3';
import { getContentForPathname } from '@builder.io/sdks-e2e-tests/specs';

export default {
  name: 'DynamicallyRenderBuilderPage',
  components: {
    'builder-render-content': RenderContent,
  },
  computed: {
    content() {
      return getContentForPathname();
    },
  },
};
</script>
