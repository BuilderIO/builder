<template>
  <div v-if="content">
    <builder-render-content model="page" :content="content" />
  </div>
  <div v-else>Content not Found</div>
</template>
<script lang="ts">
import { RenderContent } from '@builder.io/sdk-vue/vue3';
import { CONTENTS } from '@builder.io/sdks-e2e-tests/specs';

export default {
  name: 'DynamicallyRenderBuilderPage',
  components: {
    'builder-render-content': RenderContent,
  },
  computed: {
    content(): any {
      // @ts-ignore
      return this.getContent();
    },
  },
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
};
</script>
