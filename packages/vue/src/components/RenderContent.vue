<template>
  <div v-if="!isEditing" v-html="html"></div>
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

  computed: {
    html() {
      if (this.isEditing || Builder.isEditing) {
        return `<builder-component api-key="${builder.apiKey}" prerender="false" model="${
          this.model
        }" options='${JSON.stringify(this.options || {}).replace(/'/g, '&apos;')}'>`;
      }

      return this.content && this.content.data.html;
    },
  },

  props: {
    model: {
      required: true,
      type: String,
    },
    options: Object,
  },

  created() {
    if (Builder.isEditing) {
      this.isEditing = true;
      this.loadEditScript();
    }
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
    loadEditScript() {
      const editJsSrc = 'https://cdn.builder.io/js/webcomponents';
      if (!(window.BuilderWC || document.querySelector(`script[src="${editJsSrc}"]`))) {
        const script = document.createElement('script');
        script.src = editJsSrc;
        script.async = true;
        document.body.appendChild(script);
      }
    },
  },

  // For nuxt
  async fetch() {
    await this.getContent();
  },
};
</script>
