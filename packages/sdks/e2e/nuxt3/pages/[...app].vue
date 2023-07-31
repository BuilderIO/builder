<script setup>
import { RenderContent, processContentResult } from '@builder.io/sdk-vue';
import '@builder.io/sdk-vue/css';
import { getProps } from '@builder.io/sdks-e2e-tests';

const route = useRoute();

const { data: props } = await useAsyncData('builderData', () =>
  getProps({ pathname: route.path, processContentResult })
);
</script>

<template>
  <div v-if="props?.content">
    <RenderContent v-bind="props" />
  </div>
  <div v-else>Content not Found</div>
</template>
