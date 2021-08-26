<template>
  <picture>
    <img
      loading="lazy"
      class="img-2hex46lk8aw"
      :alt="altText"
      :aria-role="altText ? 'presentation' : undefined"
      :class="
        _classStringToObject(
          'builder-image' + (this.class ? ' ' + this.class : '')
        )
      "
      :src="image"
      :srcset="srcset"
      :sizes="sizes"
    />
    <source :srcSet="srcset" />
  </picture>

  <slot></slot>
</template>
<script>
export default {
  name: "Image",

  props: ["altText", "class", "image", "srcset", "sizes"],

  methods: {
    _classStringToObject(str) {
      const obj = {};
      if (typeof str !== "string") {
        return obj;
      }
      const classNames = str.trim().split(/\s+/);
      for (const name of classNames) {
        obj[name] = true;
      }
      return obj;
    },
  },
};
</script>
<style scoped>
.img-2hex46lk8aw {
  opacity: 1;
  transition: opacity 0.2s ease-in-out;
  object-fit: cover;
  object-position: center;
}
</style>
