<template>
  <div class="div-21uq6jesqkc">
    <picture>
      <img
        loading="lazy"
        class="img-21uq6jesqkc"
        :alt="altText"
        :aria-role="altText ? 'presentation' : undefined"
        :style="{
          objectPosition: backgroundSize || 'center',
          objectFit: backgroundSize || 'cover',
        }"
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
    <template
      v-if="aspectRatio && !(fitContent && builderBlock?.children?.length)"
    >
      <div
        class="builder-image-sizer div-21uq6jesqkc-2"
        :style="{
          paddingTop: aspectRatio * 100 + '%',
        }"
      >
        {{ " " }}
      </div>
    </template>
    <template v-if="builderBlock?.children?.length && fitContent">
      <slot></slot>
    </template>

    <template v-if="!fitContent">
      <div class="div-21uq6jesqkc-3">
        <slot></slot>
      </div>
    </template>
  </div>
</template>
<script>
export default {
  name: "Image",

  props: [
    "altText",
    "backgroundSize",
    "image",
    "srcset",
    "sizes",
    "aspectRatio",
    "fitContent",
    "builderBlock",
  ],

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
.div-21uq6jesqkc {
  position: relative;
}
.img-21uq6jesqkc {
  opacity: 1;
  transition: opacity 0.2s ease-in-out;
  position: absolute;
  height: 100%;
  width: 100%;
  top: 0px;
  left: 0px;
}
.div-21uq6jesqkc-2 {
  width: 100%;
  pointer-events: none;
  font-size: 0;
}
.div-21uq6jesqkc-3 {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
