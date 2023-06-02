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
import { defineComponent } from 'vue';

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
