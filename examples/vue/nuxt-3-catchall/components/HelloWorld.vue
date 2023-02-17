<template>
  <div class="hello-world">
    <div class="text">Hello {{ text }}!</div>
    <slot></slot>
  </div>
</template>

<script>
export default {
  props: {
    text: {
      type: String,
      default: 'world',
    },
  },
};
</script>

<style scoped>
.hello-world {
  display: flex;
  flex-direction: column;
}
.text {
  padding: 50px;
}
</style>
