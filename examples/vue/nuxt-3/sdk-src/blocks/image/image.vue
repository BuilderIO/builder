<template>
  <picture>
    <template v-if="webpSrcSet">
      <source type="image/webp" :srcset="webpSrcSet" />
    </template>

    <img
      loading="lazy"
      :alt="altText"
      :role="altText ? 'presentation' : undefined"
      :style="{
        objectPosition: backgroundPosition || 'center',
        objectFit: backgroundSize || 'cover',
        ...aspectRatioCss,
      }"
      :class="
        _classStringToObject(
          'builder-image' +
            (className ? ' ' + className : '') +
            ' img-7jvpanrlkn'
        )
      "
      :src="image"
      :srcset="srcSetToUse"
      :sizes="sizes"
    />
  </picture>

  <template
    v-if="aspectRatio && !(builderBlock?.children?.length && fitContent)"
  >
    <div
      class="builder-image-sizer div-7jvpanrlkn"
      :style="{
        paddingTop: aspectRatio * 100 + '%',
      }"
    ></div>
  </template>

  <template v-if="builderBlock?.children?.length && fitContent">
    <slot />
  </template>

  <template v-if="!fitContent && children">
    <div class="div-7jvpanrlkn-2">
      <slot />
    </div>
  </template>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import type { BuilderBlock } from "../../types/builder-block.js";
import { getSrcSet } from "./image.helpers.js";

export interface ImageProps {
  className?: string;
  image: string;
  sizes?: string;
  lazy?: boolean;
  height?: number;
  width?: number;
  altText?: string;
  backgroundSize?: "cover" | "contain";
  backgroundPosition?: string;
  srcset?: string;
  aspectRatio?: number;
  children?: JSX.Element;
  fitContent?: boolean;
  builderBlock?: BuilderBlock;
  noWebp?: boolean;
  src?: string;
}

export default defineComponent({
  name: "builder-image",

  props: [
    "image",
    "src",
    "srcset",
    "noWebp",
    "aspectRatio",
    "altText",
    "backgroundPosition",
    "backgroundSize",
    "className",
    "sizes",
    "builderBlock",
    "fitContent",
  ],

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

  methods: {
    _classStringToObject(str: string) {
      const obj: Record<string, boolean> = {};
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
});
</script>

<style scoped>
.img-7jvpanrlkn {
  opacity: 1;
  transition: opacity 0.2s ease-in-out;
}
.div-7jvpanrlkn {
  width: 100%;
  pointer-events: none;
  font-size: 0;
}
.div-7jvpanrlkn-2 {
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