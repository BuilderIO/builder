<template>
  <picture>
    <template v-if="webpSrcSet">
      <source type="image/webp" :srcset="webpSrcSet" />
    </template>

    <img
      :loading="highPriority ? 'eager' : 'lazy'"
      :fetchpriority="highPriority ? 'high' : 'auto'"
      :alt="altText"
      :role="altText ? undefined : 'presentation'"
      :style="{
        objectPosition: backgroundPosition || 'center',
        objectFit: backgroundSize || 'cover',
        ...aspectRatioCss,
      }"
      :class="
        'builder-image' +
        (className ? ' ' + className : '') +
        ' img-1pl23ac79ld'
      "
      :src="image"
      :srcset="srcSetToUse"
      :sizes="sizes"
  /></picture>

  <template
    v-if="aspectRatio && !(builderBlock?.children?.length && fitContent)"
  >
    <div
      class="builder-image-sizer div-1pl23ac79ld"
      :style="{
        paddingTop: aspectRatio * 100 + '%',
      }"
    ></div>
  </template>

  <template v-if="builderBlock?.children?.length && fitContent">
    <slot />
  </template>

  <template v-if="!fitContent && builderBlock?.children?.length">
    <div class="div-1pl23ac79ld-2"><slot /></div>
  </template>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { getSrcSet } from "./image.helpers";
import type { ImageProps } from "./image.types";

export default defineComponent({
  name: "builder-image",

  props: [
    "image",
    "src",
    "srcset",
    "noWebp",
    "aspectRatio",
    "highPriority",
    "altText",
    "backgroundPosition",
    "backgroundSize",
    "className",
    "sizes",
    "builderBlock",
    "fitContent",
  ],

  mounted() {},

  computed: {
    srcSetToUse() {
      const imageToUse = this.image || this.src;
      const url = imageToUse;
      if (
        !url ||
        // We can auto add srcset for cdn.builder.io and shopify
        // images, otherwise you can supply this prop manually
        !(url.match(/builder\.io/) || url.match(/cdn\.shopify\.com/))
      ) {
        return this.srcset;
      }
      if (this.noWebp) {
        return undefined; // no need to add srcset to svg images
      }
      if (this.srcset && this.image?.includes("builder.io/api/v1/image")) {
        if (!this.srcset.includes(this.image.split("?")[0])) {
          console.debug("Removed given srcset");
          return getSrcSet(url);
        }
      } else if (this.image && !this.srcset) {
        return getSrcSet(url);
      }
      return getSrcSet(url);
    },
    webpSrcSet() {
      if (this.srcSetToUse?.match(/builder\.io/) && !this.noWebp) {
        return this.srcSetToUse.replace(/\?/g, "?format=webp&");
      } else {
        return "";
      }
    },
    aspectRatioCss() {
      const aspectRatioStyles = {
        position: "absolute",
        height: "100%",
        width: "100%",
        left: "0px",
        top: "0px",
      } as const;
      const out = this.aspectRatio ? aspectRatioStyles : undefined;
      return out;
    },
  },
});
</script>

<style scoped>
.img-1pl23ac79ld {
  opacity: 1;
  transition: opacity 0.2s ease-in-out;
}
.div-1pl23ac79ld {
  width: 100%;
  pointer-events: none;
  font-size: 0;
}
.div-1pl23ac79ld-2 {
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