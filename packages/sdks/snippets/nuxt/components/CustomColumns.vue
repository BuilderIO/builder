<template>
    <!-- Left Column -->
      <Blocks
        :parent="builderBlock.id"
        :path="'leftContent'"
        :blocks="leftContent"
      />
    <!-- Right Column -->
      <Blocks
        :parent="builderBlock.id"
        :path="'rightContent'"
        :blocks="rightContent"
      />
  </template>
    
  <script setup lang="ts">
  import { Blocks, type BuilderBlock } from '@builder.io/sdk-vue';
  
  const { leftContent, rightContent, builderBlock } = defineProps<{
    leftContent: BuilderBlock[];
    rightContent: BuilderBlock[];
    builderBlock: BuilderBlock;
  }>();
  </script>