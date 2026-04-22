<template>
  <ul v-if="links.data?.links">
    <li v-for="(link, index) in links.data.links" :key="index">
      <a :href="link.url">{{ link.text }}</a>
    </li>
  </ul>
</template>

<script setup lang="ts">
import type { BuilderContent } from '@builder.io/sdk-vue';
const props = defineProps<{ links: BuilderContent }>();
</script>
