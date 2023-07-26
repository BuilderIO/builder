<script lang="ts">
import { RenderContent, getContent, isPreviewing } from '@builder.io/sdk-vue';
import { Builder } from '@builder.io/sdk';
import '@builder.io/sdk-vue/vue3/css';

import HelloWorldComponent from './components/HelloWorld.vue';
import LargeBodyText from './components/LargeBodyText.vue';

Builder.register('insertMenu', {
  name: 'Typography Components',
  items: [
    {name: 'Hello World'},
    {name: 'LargeBodyText'},
    {name: 'LargeBodyText'},
    {name: 'LargeBodyText'},
    {name: 'LargeBodyText'},
    {name: 'LargeBodyText'},
    {name: 'LargeBodyText'},
    {name: 'LargeBodyText'},
    {name: 'LargeBodyText'}
  ]
})

// Register your Builder components
const REGISTERED_COMPONENTS = [
  {
    component: HelloWorldComponent,
    name: 'Hello World',
    canHaveChildren: true,
    inputs: [
      {
        name: 'text',
        type: 'string',
        defaultValue: 'World',
      },
    ],
  },
  {
    component: LargeBodyText,
    name: 'Large Body Text',
    canHaveChildren: true,
    // defaultChildren: [
    //   {
    //     '@type': '@builder.io/sdk:Element',
    //     component: { name: 'Text', options: { text: 'Large Body text here' } },
    //   },
    // ],
    inputs: [
      {
        name: 'underline',
        type: 'text',
        defaultValue: 'false',
      },
    ],
    // defaultStyles: {
    //   marginTop: '0px',
    // },
  }
];

// TODO: enter your public API key
const BUILDER_PUBLIC_API_KEY = '271bdcf584e24ca896dede7a91dfb1cb'; // ggignore

export default {
  name: 'DynamicallyRenderBuilderPage',
  components: {
    'builder-render-content': RenderContent,
  },
  data: () => ({
    canShowContent: false,
    content: null,
    apiKey: BUILDER_PUBLIC_API_KEY,
  }),
  methods: {
    getRegisteredComponents() {
      return REGISTERED_COMPONENTS;
    },
  },
  mounted() {
    getContent({
      model: 'page',
      apiKey: BUILDER_PUBLIC_API_KEY,
      userAttributes: {
        urlPath: window.location.pathname,
      },
    }).then(res => {
      this.content = res;
      this.canShowContent = this.content || isPreviewing();
    });
  },
};
</script>

<template>
  <header>
    <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />
  </header>
  <div>
    <div>Hello world from your Vue 3 project. Below is Builder Content:</div>
    <div v-if="canShowContent">
      <div>
        page title:
        {{ (content && content.data && content.data.title) || 'Unpublished' }}
      </div>
      <builder-render-content
        model="page"
        :content="content"
        :api-key="apiKey"
        :customComponents="getRegisteredComponents()"
      />
    </div>
    <div v-else>Content not Found</div>
  </div>
</template>

<style>
#app {
  margin: 0 auto;
  padding: 2rem;

  font-weight: normal;
}
</style>
