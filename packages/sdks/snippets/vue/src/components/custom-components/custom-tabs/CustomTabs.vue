<template>
    <div class="dynamics-slots" v-if="tabList.length">
      <button
        v-for="(tab, index) in tabList"
        :key="index"
        :class="{ 'active': activeTab === index }"
        @click="activeTab = index"
      >
        {{ tab.tabName }}
      </button>

      <Blocks
        :blocks="tabList[activeTab].blocks"
        :path="`tabList.${activeTab}.blocks`"
        :parent="props.builderBlock?.id"
      />
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, defineProps } from 'vue';
  import { Blocks, type BuilderBlock } from '@builder.io/sdk-vue';
  
  interface TabItem {
    tabName: string;
    blocks: BuilderBlock[];
  }

  const props = defineProps({
    builderBlock: Object,
    tabList: Array<TabItem>
  });
  
  const tabList = computed(() => props.tabList || []);
  
  const activeTab = ref(0);
  
  </script>
  
  