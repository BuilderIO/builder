<template>
  <button v-bind="attributes" type="submit">
    {{ text }}
  </button>
</template>
<script>
export default {
  name: "submit-button",

  props: ["attributes", "text"],
};
</script>
