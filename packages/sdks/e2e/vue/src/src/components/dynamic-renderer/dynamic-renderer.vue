<template>
  <template v-if="!isEmptyElement(TagName)">
    <template v-if="typeof TagName === 'string'">
      <component :is="TagName" v-bind="attributes" v-on="actionAttributes"
        ><slot
      /></component>
    </template>

    <template v-else>
      <component :is="TagName" v-bind="attributes" v-on="actionAttributes"
        ><slot
      /></component>
    </template>
  </template>

  <template v-else>
    <component
      :is="TagName"
      v-bind="attributes"
      v-on="actionAttributes"
    ></component>
  </template>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent } from "vue";

import { isEmptyElement } from "./dynamic-renderer.helpers";
import { setAttrs } from "../../blocks/helpers";

export interface DynamicRendererProps {
  children?: any;
  TagName: any;
  attributes: any;
  actionAttributes: any;
}

export default defineComponent({
  name: "dynamic-renderer",

  props: ["TagName", "attributes", "actionAttributes"],

  data() {
    return { isEmptyElement };
  },
});
</script>