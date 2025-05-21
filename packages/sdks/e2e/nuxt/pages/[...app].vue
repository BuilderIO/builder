<script setup lang="ts">
import {
  Content,
  _processContentResult,
  setClientUserAttributes,
  registerAction,
} from '@builder.io/sdk-vue';
import BuilderBlockWithClassName from '../components/BuilderBlockWithClassName.vue';
import { getProps } from '@sdk/tests';

if (typeof window !== 'undefined') {
  if (window.location.pathname === '/variant-containers') {
    setClientUserAttributes({
      device: 'tablet',
    });
  }
  registerAction({
    name: "test-action",
    kind: 'function',
    id: 'test-action-id',
    inputs:[
      {
        name: "actionName",
        type: "string",
        required: true,
        helperText: "Action name",
      },
    ],
    action: () => {
      return console.log("function call")
    },
  });
}

const route = useRoute();

const REGISTERED_COMPONENTS = [
  {
    name: 'BuilderBlockWithClassName',
    component: BuilderBlockWithClassName,
    shouldReceiveBuilderProps: {
      builderBlock: true,
      builderContext: true,
      builderComponents: true,
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

const { data: props } = await useAsyncData('builderData', async () => {
  const props = await getProps({ pathname: route.path, _processContentResult });
  return props;
});
</script>

<template>
  <div v-if="props">
    <Content v-bind="props" :customComponents="REGISTERED_COMPONENTS" />
  </div>
  <div v-else>Content not Found</div>
</template>
