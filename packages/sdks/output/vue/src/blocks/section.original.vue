<template>
  <section
    v-bind="attributes"
    :style="
      maxWidth && typeof maxWidth === 'number'
        ? {
            maxWidth: maxWidth,
          }
        : undefined
    "
  >
    <slot></slot>
  </section>
</template>
<script>
export default {
  name: "SectionComponent",

  props: ["attributes", "maxWidth"],
};
</script>
