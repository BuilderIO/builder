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
    <span v-bind="attributes">{{ text }}</span>
  </template>
</template>
<script>
export default {
  name: "button",

  props: ["link", "attributes", "openLinkInNewTab", "text"],
};
</script>
