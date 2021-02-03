<template>
  <div>
    <template v-if="isEditing">
      <builder-component prerender="false" :model="model" :options="options"></builder-component>
      <script async src="https://cdn.builder.io/js/webcomponents"></script>
    </template>
    <div v-if="!isEditing" v-html="content && content.data.html"></div>
  </div>
</template>

<script>
import { builder, Builder } from '@builder.io/sdk';

export default {
  name: 'RenderContent',

  data: () => ({
    isEditing: Builder.isEditing,
    fetchInitialized: false,
    content: null,
  }),

  props: {
    model: {
      required: true,
      type: String,
    },
    options: Object,
  },
  created() {
    if (!this.fetchInitialized) {
      this.getContent();
    }
  },
  methods: {
    async getContent() {
      // For Nuxt - flag to know if the fetch hook ran
      this.fetchInitialized = true;
      this.content = await builder.get(this.model, this.options).promise();
    },
  },
  // For nuxt
  async fetch() {
    await this.getContent();
  },
};
</script>
