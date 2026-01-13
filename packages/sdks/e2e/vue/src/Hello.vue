<template>
  <div>hello {{ context?.builderContent?.data?.title || 'World' }}</div>
</template>

<script>
export default {
  props: {
    context: {
      type: Object,
      default: () => ({}),
    },
  },
};
</script>
