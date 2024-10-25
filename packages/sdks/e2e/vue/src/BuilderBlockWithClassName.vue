<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { Blocks, type BuilderBlock } from '@builder.io/sdk-vue';

export default defineComponent({
  name: 'BuilderBlockWithClassName',
  components: {
    Blocks,
  },
  props: {
    builderBlock: {
      type: Object as PropType<BuilderBlock>,
      required: true,
    },
    content: {
      type: Array as PropType<BuilderBlock[]>,
      required: true,
    },
    builderContext: {
      type: Object,
      required: true,
    },
    builderComponents: {
      type: Object,
      required: true,
    },
  },
});
</script>

<template>
  <div>
    <Blocks
      :parent="builderBlock?.id"
      path="component.options.content"
      :context="builderContext"
      :registeredComponents="builderComponents"
      :blocks="content"
      className="test-class-name"
    />
  </div>
</template>
