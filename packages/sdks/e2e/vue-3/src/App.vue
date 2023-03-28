<script lang="ts">
import { RenderContent } from '@builder.io/sdk-vue/vue3';
import '@builder.io/sdk-vue/vue3/css';
import { getProps } from '@builder.io/sdks-e2e-tests';
import { getCustomComponents } from '@builder.io/sdks-tests-custom-components/output/vue/vue3/src/index';

export default {
  name: 'DynamicallyRenderBuilderPage',
  components: {
    'builder-render-content': RenderContent,
  },
  computed: {
    props() {
      return { ...getProps(), customComponents: getCustomComponents() };
    },
  },
};
</script>

<template>
  <div v-if="props">
    <builder-render-content v-bind="props" />
  </div>
  <div v-else>Content not Found</div>
</template>
