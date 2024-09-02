<template>
  <div v-if="props.content">
    <builder-render-content v-bind="props" />
  </div>
  <div v-else>Content not Found</div>
</template>
<script lang="ts">
import '@builder.io/sdk-vue/css';
import { RenderContent, _processContentResult } from '@builder.io/sdk-vue/vue2';
import { getProps } from '@e2e/tests';
import { defineComponent } from 'vue';
import Hello from './components/Hello.vue';

export default defineComponent({
  name: 'DynamicallyRenderBuilderPage',
  components: {
    'builder-render-content': RenderContent,
  },
  data() {
    return { props: {} as any };
  },
  mounted() {
    getProps({ _processContentResult }).then((props) => {
      const constructedProps = {
        ...props,
        customComponents: [
          {
            name: 'Hello',
            component: Hello,
            inputs: [],
            ...(window.location.pathname.includes(
              'custom-components-models'
            ) && {
              models: ['test-model'],
            }),
          },
        ],
      };
      this.props = constructedProps;
    });
  },
});
</script>
