<template>
  <img
    :style="{
      objectFit: backgroundSize || 'cover',
      objectPosition: backgroundPosition || 'center',
    }"
    :key="(isEditing() && imgSrc) || 'default-key'"
    :alt="altText"
    :src="imgSrc || image"
    v-bind="filterAttrs(attributes, 'v-on:', false)"
    v-on="filterAttrs(attributes, 'v-on:', true)"
  />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { isEditing } from "../../functions/is-editing";
import { filterAttrs } from "../helpers";
import { setAttrs } from "../helpers";

/**
 * This import is used by the Svelte SDK. Do not remove.
 */

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
    return { isEditing, filterAttrs };
  },
});
</script>