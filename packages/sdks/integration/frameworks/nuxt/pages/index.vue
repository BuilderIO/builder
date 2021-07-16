<template></template>

<script lang="ts">
import Vue from 'vue'
import { RenderContent } from '@builder.io/sdk-vue'

// TODO: .d.ts compilation for the JSX Lite SDK code
type BuilderContent = any

const content: BuilderContent = {
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
            color: 'white',
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
}

console.log(RenderContent)

export default Vue.extend({
  data: () => ({
    content,
  }),
  components: {
    RenderContent,
  },
})
</script>
