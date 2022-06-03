<template>
  <button v-bind="attributes" type="submit">
    {{ text }}
  </button>
</template>
<script>
export default {
  name: "builder-submit-button",

  props: ["attributes", "text"],
};
</script>
