<template>
  <div class="text">Hello {{ text }}!</div>
</template>

<script>
export default {
  props: {
    text: {
      type: String,
      default: 'world',
    },
  },
}
</script>

<style scoped>
.text {
  padding: 50px;
}
</style>
