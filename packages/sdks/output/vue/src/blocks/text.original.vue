<template>
  <div class="builder-text" v-html="text"></div>
</template>
<script>
export default {
  name: "text",

  props: ["text"],
};
</script>
