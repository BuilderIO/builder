<template>
  <div v-if="content">
    <builder-render-content
      model="page"
      :content="content"
      :api-key="apiKey"
      :customComponents="getRegisteredComponents()"
    />
  </div>
  <div v-else>Content not Found</div>
</template>
<script>
import { RenderContent } from '@builder.io/sdk-vue/vue3';
import { CONTENTS } from '@builder.io/sdks-e2e-tests/specs';

export default {
  name: 'DynamicallyRenderBuilderPage',
  components: {
    'builder-render-content': RenderContent,
  },
  data: () => ({
    content: null,
  }),
  methods: {
    getContent() {
      switch (window.location.pathname) {
        case '/':
          return CONTENTS.HOME;
        case '/columns':
          return CONTENTS.COLUMNS;
        default:
          return null;
      }
    },
  },
  mounted() {
    this.content = this.getContent();
  },
};
</script>
