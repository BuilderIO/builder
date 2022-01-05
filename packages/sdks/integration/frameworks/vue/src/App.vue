<template>
  <div>
    <RenderContent model="page" :content="content" />
  </div>
</template>

<script>
import { RenderContent } from '@builder.io/sdk-vue';

// TODO: .d.ts compilation for the JSX Lite SDK code
const content = {
  data: {
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        responsiveStyles: {
          large: {
            padding: '20px',
            backgroundColor: 'red',
            color: 'white',
          },
        },
        component: {
          name: 'Text',
          options: {
            text: 'Hi there',
          },
        },
      },
      {
        '@type': '@builder.io/sdk:Element',
        responsiveStyles: {
          large: {
            margin: '10px',
            padding: '20px',
            backgroundColor: 'white',
          },
        },
        component: {
          name: 'Text',
          options: {
            text: 'Hello',
          },
        },
      },
    ],
  },
};

export default {
  name: 'App',
  data: () => ({ content }),
  components: {
    RenderContent,
  },
};
</script>
