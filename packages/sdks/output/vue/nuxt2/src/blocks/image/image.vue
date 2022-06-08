<template>
  <div class="div-1ifnufbde19">
    <picture>
      <img
        loading="lazy"
        class="img-1ifnufbde19"
        :alt="altText"
        :role="altText ? 'presentation' : undefined"
        :style="{
          objectPosition: backgroundSize || 'center',
          objectFit: backgroundSize || 'cover',
        }"
        :class="
          _classStringToObject(
            'builder-image' + (this.className ? ' ' + this.className : '')
          )
        "
        :src="image"
        :srcSet="srcset"
        :sizes="sizes"
      />
      <source :srcSet="srcset" />
    </picture>

    <div
      class="builder-image-sizer div-1ifnufbde19-2"
      v-if="aspectRatio && !(fitContent && ((builderBlock && builderBlock.children) && (builderBlock && builderBlock.children).length))"
      :style="{
        paddingTop: aspectRatio * 100 + '%',
      }"
    >
      {{ " " }}
    </div>

    <slot></slot>

    <div class="div-1ifnufbde19-3" v-if="!fitContent">
      <slot></slot>
    </div>
  </div>
</template>
<script>
export default {
  name: "builder-image",

  props: [
    "altText",
    "backgroundSize",
    "className",
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
.div-1ifnufbde19 {
  position: relative;
}
.img-1ifnufbde19 {
  opacity: 1;
  transition: opacity 0.2s ease-in-out;
  position: absolute;
  height: 100%;
  width: 100%;
  top: 0px;
  left: 0px;
}
.div-1ifnufbde19-2 {
  width: 100%;
  pointer-events: none;
  font-size: 0;
}
.div-1ifnufbde19-3 {
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
