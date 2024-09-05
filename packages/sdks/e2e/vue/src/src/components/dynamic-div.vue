<template>
  <div><slot /></div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export interface DynamicDivProps {
  children?: any;
  attributes: any;
  actionAttributes: any;
  BlockWrapperProps: any;
  builderPath: any;
  builderParentId: any;
  BlocksWrapperProps: any;
  contentWrapperProps: any;
  builderModel: any;
  ref: any;
}

export default defineComponent({
  name: "dynamic-div",

  props: [],
});
</script>