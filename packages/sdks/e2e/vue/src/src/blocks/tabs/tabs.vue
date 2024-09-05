<template>
  <div>
    <div
      class="builder-tabs-wrap"
      :style="{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: tabHeaderLayout || 'flex-start',
        overflow: 'auto',
      }"
    >
      <template :key="index" v-for="(tab, index) in tabs">
        <span
          :class="`builder-tab-wrap ${
            activeTab === index ? 'builder-tab-active' : ''
          }`"
          :style="{
            ...(activeTab === index ? activeTabStyle : {}),
          }"
          @click="onClick(index)"
          ><Blocks
            :parent="builderBlock.id"
            :path="`component.options.tabs.${index}.label`"
            :blocks="tab.label"
            :context="builderContext"
            :registeredComponents="builderComponents"
            :linkComponent="builderLinkComponent"
          ></Blocks
        ></span>
      </template>
    </div>
    <template v-if="activeTabContent(activeTab)">
      <div>
        <Blocks
          :parent="builderBlock.id"
          :path="`component.options.tabs.${activeTab}.content`"
          :blocks="activeTabContent(activeTab)"
          :context="builderContext"
          :registeredComponents="builderComponents"
          :linkComponent="builderLinkComponent"
        ></Blocks>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import Blocks from "../../components/blocks/blocks.vue";
import type { BuilderBlock } from "../../types/builder-block";
import type { TabsProps } from "./tabs.types";

export default defineComponent({
  name: "builder-tabs",
  components: { Blocks: Blocks },
  props: [
    "defaultActiveTab",
    "tabs",
    "collapsible",
    "tabHeaderLayout",
    "activeTabStyle",
    "builderBlock",
    "builderContext",
    "builderComponents",
    "builderLinkComponent",
  ],

  data() {
    return { activeTab: this.defaultActiveTab ? this.defaultActiveTab - 1 : 0 };
  },

  methods: {
    activeTabContent(active: number) {
      return this.tabs && this.tabs[active].content;
    },
    onClick(index: number) {
      if (index === this.activeTab && this.collapsible) {
        this.activeTab = -1;
      } else {
        this.activeTab = index;
      }
    },
  },
});
</script>