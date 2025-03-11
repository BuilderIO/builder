<template>
    <div class="two-column-layout" :style="{ gap: gap + 'px', display: 'flex' }">
      <!-- Left Column -->
      <div class="column" :style="{ flex: leftWidth }">
        <Blocks
          :parent="props.builderBlock?.id"
          :path="'leftContent'"
          :blocks="leftContent"
        />
      </div>
      
      <!-- Right Column -->
      <div class="column" :style="{ flex: rightWidth }">
        <Blocks
          :parent="props.builderBlock?.id"
          :path="'rightContent'"
          :blocks="rightContent"
        />
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { Blocks } from '@builder.io/sdk-vue';
  
  const props = defineProps({
    leftContent: Array,
    rightContent: Array,
    leftWidth: {
      type: Number,
      default: 1
    },
    rightWidth: {
      type: Number,
      default: 1
    },
    gap: {
      type: Number,
      default: 20
    },
    builderBlock: Object
  });
  </script>