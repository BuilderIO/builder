<template>
  <!-- Left Column -->
  <Blocks :parent="builderBlock.id" :path="'column1'" :blocks="column1" />
  <!-- Right Column -->
  <Blocks :parent="builderBlock.id" :path="'column2'" :blocks="column2" />
</template>

<script setup lang="ts">
import { Blocks, type BuilderBlock } from '@builder.io/sdk-vue';

const { column1, column2, builderBlock } = defineProps<{
  column1: BuilderBlock[];
  column2: BuilderBlock[];
  builderBlock: BuilderBlock;
}>();
</script>
