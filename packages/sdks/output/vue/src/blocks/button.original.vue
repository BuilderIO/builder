<template>
  <template v-if="link">
    <a
      v-bind="attributes"
      :href="link"
      :target="openLinkInNewTab ? '_blank' : undefined"
    >
      {{ text }}
    </a>
  </template>

  <template v-if="!link">
    <button v-bind="attributes" type="button">
      {{ text }}
    </button>
  </template>
</template>
<script>
export default {
  name: "Button",

  props: ["link", "attributes", "openLinkInNewTab", "text"],
};
</script>
