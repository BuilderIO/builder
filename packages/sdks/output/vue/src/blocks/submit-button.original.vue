<template>
  <button v-bind="attributes" type="submit">
    {{ text }}
  </button>
</template>
<script>
export default {
  name: "SubmitButton",

  props: ["attributes", "text"],
};
</script>
