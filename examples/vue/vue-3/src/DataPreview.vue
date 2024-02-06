<script lang="ts">
import { fetchOneEntry, subscribeToEditor } from '@builder.io/sdk-vue';

// TODO: enter your public API key
const BUILDER_PUBLIC_API_KEY = 'f1a790f8c3204b3b8c5c1795aeac4660'; // ggignore

export default {
  data: () => ({
    content: null,
    unsubscribeFromEditor: () => {},
  }),
  mounted() {
    fetchOneEntry({
      model: 'coffee',
      apiKey: BUILDER_PUBLIC_API_KEY,
    }).then(res => {
      this.content = res;
    });

    const unsubscribe = subscribeToEditor('coffee', content => {
      this.content = content;
    });

    this.unsubscribeFromEditor = unsubscribe;
  },

  beforeUnmount() {
    if (this.unsubscribeFromEditor) {
      this.unsubscribeFromEditor();
    }
  },
};
</script>

<template>
  <div>coffee name: {{ content?.data?.name }}</div>
  <div>coffee info: {{ content?.data?.info }}</div>
</template>

<style>
#app {
  margin: 0 auto;
  padding: 2rem;

  font-weight: normal;
}
</style>
