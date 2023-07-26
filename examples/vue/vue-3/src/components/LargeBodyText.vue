<script>

export default {
  props: {
    underline: { 
        required: false, 
        type: Boolean, 
        default: false
    },
  },
};

</script>

<template>
  <div
    class="font-semibold text-base md:text-lg md:leading-6"
  >
    <span>{{ underline }} </span>
    <slot></slot>
  </div>
</template>

<style scoped>
.font-semibold {
  display: flex;
  flex-direction: column;
}
.text-base {
  padding: 50px;
}
</style>
