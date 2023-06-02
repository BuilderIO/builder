<script lang="ts">
import { defineComponent } from 'vue';
import { RenderContent } from '@builder.io/sdk-vue/vue3';
import '@builder.io/sdk-vue/vue3/css';
import { getProps } from '@builder.io/sdks-e2e-tests';

export default defineComponent({
  name: 'DynamicallyRenderBuilderPage',
  components: {
    'builder-render-content': RenderContent,
  },
  data() {
    return { props: {} as any };
  },
  mounted() {
    getProps().then((props) => {
      this.props = props;
    });
  },
});
</script>

<template>
  <div v-if="props.content">
    <builder-render-content v-bind="props" />
  </div>
  <div v-else>Content not Found</div>
</template>
