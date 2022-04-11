<template>
  <sf-tab v-bind="allPassedAttributes">
    <!--
      we need to wrap children in render-blocks, so that Builder content can still be properly
      rendered. This is similar to what Builder does for its Columns components.
    -->
    <render-blocks :blocks="builderBlock.children"></render-blocks>
  </sf-tab>
</template>

<script>
// TO-DO: clean up both of these internal imports
import SfTab from '@storefront-ui/vue/src/components/organisms/SfTabs/_internal/SfTab.vue';
import RenderBlocks from '@builder.io/sdk-vue/nuxt2/src/components/render-blocks.vue';

export default {
  components: { SfTab, RenderBlocks },
  name: 'CustomSfTab',
  props: {
    builderBlock: {
      type: Object,
    },
  },
  computed: {
    allPassedAttributes() {
      const { attributes, ...other } = this.$attrs;
      return {
        // these are special Builder attributes that we need to pass through
        ...attributes,
        // these are all the actual props for the sf-tab component
        ...other,
      };
    },
  },
};
</script>
