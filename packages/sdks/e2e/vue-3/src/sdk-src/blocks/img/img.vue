<template>
  <img
    :style="{
      objectFit: backgroundSize || 'cover',
      objectPosition: backgroundPosition || 'center',
    }"
    :key="(isEditing() && imgSrc) || 'default-key'"
    :alt="altText"
    :src="imgSrc || image"
    v-bind="filterAttrs(attributes, false)"
    v-on="filterAttrs(attributes, true)"
  />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { isEditing } from "../../functions/is-editing.js";

export interface ImgProps {
  attributes?: any;
  imgSrc?: string; // TODO(misko): I think this is unused
  image?: string;
  altText?: string;
  backgroundSize?: "cover" | "contain";
  backgroundPosition?:
    | "center"
    | "top"
    | "left"
    | "right"
    | "bottom"
    | "top left"
    | "top right"
    | "bottom left"
    | "bottom right";
}

export default defineComponent({
  name: "builder-img-component",

  props: [
    "backgroundSize",
    "backgroundPosition",
    "imgSrc",
    "altText",
    "image",
    "attributes",
  ],

  data() {
    return { isEditing };
  },

  methods: {
    filterAttrs: function filterAttrs(attrs = {}, isEvent) {
      const eventPrefix = "v-on:";
      return Object.keys(attrs)
        .filter((attr) => {
          if (!attrs[attr]) {
            return false;
          }
          const isEventVal = attr.startsWith(eventPrefix);
          return isEvent ? isEventVal : !isEventVal;
        })
        .reduce(
          (acc, attr) => ({
            ...acc,
            [attr.replace(eventPrefix, "")]: attrs[attr],
          }),
          {}
        );
    },
  },
});
</script>