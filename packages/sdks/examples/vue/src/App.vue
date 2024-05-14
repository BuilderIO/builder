<template>
  <Content
    v-if="canShowContent"
    model="page"
    :content="content"
    :api-key="apiKey"
  />
</template>

<script>
import {
  fetchOneEntry,
  Content,
  isPreviewing,
  getBuilderSearchParams,
} from '@builder.io/sdk-vue';

export default {
  components: {
    Content,
  },
  data: () => ({
    canShowContent: false,
    content: null,
    apiKey: '75515d9050724317bfaeb81ca89328c9',
  }),
  mounted() {
    fetchOneEntry({
      model: 'page',
      apiKey: this.apiKey,
      options: getBuilderSearchParams(new URL(location.href).searchParams),
      userAttributes: {
        urlPath: window.location.pathname,
      },
    }).then((res) => {
      this.content = res;
      this.canShowContent = this.content || isPreviewing();
    });
  },
};
</script>
