<script lang="ts">
import { defineComponent } from 'vue';
import { Content } from '@builder.io/sdk-vue';
import BuilderBlockWithClassName from './BuilderBlockWithClassName.vue';

const REGISTERED_COMPONENTS = [
  {
    name: 'BuilderBlockWithClassName',
    component: BuilderBlockWithClassName,
    shouldReceiveBuilderProps: {
      builderBlock: true,
    },
    inputs: [
      {
        name: 'content',
        type: 'uiBlocks',
        defaultValue: [
          {
            '@type': '@builder.io/sdk:Element',
            '@version': 2,
            id: 'builder-c6e179528dee4e62b337cf3f85d6496f',
            component: {
              name: 'Text',
              options: {
                text: 'Enter some text...',
              },
            },
            responsiveStyles: {
              large: {
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                flexShrink: '0',
                boxSizing: 'border-box',
                marginTop: '20px',
                lineHeight: 'normal',
                height: 'auto',
              },
            },
          },
        ],
      },
    ],
  },
];

export default defineComponent({
  name: 'DynamicallyRenderBuilderPage',
  components: {
    'builder-render-content': Content,
  },
  props: ['props'],
  data() {
    return {
      registeredComponents: REGISTERED_COMPONENTS,
    };
  },
});
</script>

<template>
  <div v-if="props?.content">
    <builder-render-content
      v-bind="props"
      :customComponents="registeredComponents"
    />
  </div>
  <div v-else>Content not Found</div>
</template>
