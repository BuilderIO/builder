<template>
  <div id="home">
    <div>Hello world from your Vue project. Below is Builder Content:</div>

    <div v-if="canShowContent">
      <div>
        page:
        {{ (content && content.data && content.data.title) || 'Unpublished' }}
      </div>
      <builder-render-content
        model="page"
        :content="content"
        :api-key="apiKey"
        :customComponents="getRegisteredComponents()"
      />
    </div>
  </div>
</template>
<script>
import Vue from 'vue';

import { REGISTERED_COMPONENTS } from './init-builder.ts';
import * as BuilderSDK from '@builder.io/sdk-vue';
import BuilderRenderContent from '@builder.io/sdk-vue/RenderContent';

// TODO: enter your public API key
const BUILDER_PUBLIC_API_KEY = 'f1a790f8c3204b3b8c5c1795aeac4660'; // ggignore

export default Vue.extend({
  name: 'BuilderContent',
  components: {
    'builder-render-content': BuilderRenderContent,
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
    BuilderSDK.getContent({
      model: 'page',
      apiKey: BUILDER_PUBLIC_API_KEY,
      options: BuilderSDK.getBuilderSearchParams(
        BuilderSDK.convertSearchParamsToQueryObject(new URLSearchParams(window.location.search))
      ),
      userAttributes: {
        urlPath: window.location.pathname,
      },
    }).then(res => {
      this.content = res;
      this.canShowContent = this.content || BuilderSDK.isEditing() || BuilderSDK.isPreviewing();
    });
  },
});
</script>

<style>
#home {
  box-sizing: border-box;
  padding: 0 var(--spacer-sm);
  max-width: 1240px;
  padding: 0;
  margin: 0 auto;
}
</style>
