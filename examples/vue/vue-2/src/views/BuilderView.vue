<template>
  <div id="app">
    <img alt="Vue logo" src="assets/logo.png" />
    <div>
      <div>Hello world from your Vue 2 project. Below is Builder Content:</div>
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
  </div>
</template>

<script>
import { RenderContent, getContent, isPreviewing } from '@builder.io/sdk-vue/vue2';
import '@builder.io/sdk-vue/vue2/css';

// Register your Builder components
import HelloWorldComponent from '../components/HelloWorld.vue';

export const REGISTERED_COMPONENTS = [
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
];

// TODO: enter your public API key
const BUILDER_PUBLIC_API_KEY = 'f1a790f8c3204b3b8c5c1795aeac4660'; // ggignore

export default {
  name: 'App',
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

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
