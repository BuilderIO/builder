<template>
  <sf-tab v-bind="pass">
    <!--
      we need to wrap children in render-blocks, so that Builder content can still be properly
      rendered. This is similar to what Builder does for its Columns components.
    -->
    <render-blocks :blocks="builderBlock.children"></render-blocks>
  </sf-tab>
</template>

<script>
// TO-DO: chat w/ Vue Storefront to make importing internals more ergonomic
import SfTab from '@storefront-ui/vue/src/components/organisms/SfTabs/_internal/SfTab.vue';
import RenderBlocks from '@builder.io/sdk-vue/nuxt2/src/components/render-blocks.vue';

export default {
  components: { SfTab, RenderBlocks },
  name: 'CustomSfTab',
  props: {
    builderBlock: {
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    pass() {
      const { attributes, ...other } = this.$attrs;
      return {
        ...attributes,
        ...other,
      };
    },
  },
};
</script>
