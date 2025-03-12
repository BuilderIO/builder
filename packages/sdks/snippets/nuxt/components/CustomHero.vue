<template>
  <div>This is text from your component</div>
  <!-- The slot will render any child blocks from Builder -->
  <slot />
</template>

<script setup lang="ts">
defineProps<{
  text?: string;
}>();

defineOptions({
  name: 'CustomHero'
});
</script>
  