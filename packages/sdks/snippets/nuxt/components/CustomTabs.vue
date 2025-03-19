<template>
  <div class="dynamics-slots" v-if="tabList.length">
    <button
      v-for="(tab, index) in tabList"
      :key="index"
      :class="{ active: activeTab === index }"
      @click="activeTab = index"
    >
      {{ tab.tabName }}
    </button>

    <Blocks
      :blocks="tabList[activeTab].blocks"
      :path="`tabList.${activeTab}.blocks`"
      :parent="builderBlock.id"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps } from 'vue';
import { Blocks, type BuilderBlock } from '@builder.io/sdk-vue';

const activeTab = ref(0);

const { builderBlock, tabList } = defineProps<{
  builderBlock: BuilderBlock;
  tabList: Array<{
    tabName: string;
    blocks: BuilderBlock[];
  }>;
}>();
</script>
