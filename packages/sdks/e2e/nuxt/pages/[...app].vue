<script setup>
import { Content, _processContentResult } from '@builder.io/sdk-vue';
import { getProps } from '@sdk/tests';

const route = useRoute();

const { data: props } = await useAsyncData('builderData', () =>
  getProps({ pathname: route.path, _processContentResult })
);
</script>

<template>
  <div v-if="props?.content">
    <Content v-bind="props" />
  </div>
  <div v-else>Content not Found</div>
</template>
