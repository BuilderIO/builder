<script setup>
import { RenderContent } from '@builder.io/sdk-vue/vue3';
import '@builder.io/sdk-vue/vue3/css';
import { getProps } from '@builder.io/sdks-e2e-tests';

const route = useRoute();

const { data: props } = await useAsyncData('builderData', () =>
  getProps(route.path)
);
</script>

<template>
  <div v-if="props?.content">
    <RenderContent v-bind="props" />
  </div>
  <div v-else>Content not Found</div>
</template>
