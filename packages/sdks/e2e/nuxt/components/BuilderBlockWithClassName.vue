<script setup lang="ts">
import { Blocks, type BuilderBlock } from '@builder.io/sdk-vue';
const props = defineProps<{
  builderBlock?: BuilderBlock;
  builderContext?: any;
  builderComponents?: any;
  content?: any[];
}>();
</script>

<template>
  <div>
    <Blocks
      :parent="builderBlock?.id"
      path="component.options.content"
      :context="builderContext"
      :registeredComponents="builderComponents"
      :blocks="content"
      class="test-class-name"
    />
  </div>
</template>
