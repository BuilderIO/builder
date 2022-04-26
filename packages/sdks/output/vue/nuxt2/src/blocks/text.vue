<template>
  <div class="builder-text" v-html="text"></div>
</template>
<script>
export default {
  name: "builder-text",

  props: ["text"],
};
</script>
