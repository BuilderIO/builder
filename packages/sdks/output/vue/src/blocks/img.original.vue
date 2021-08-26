<template>
  <img
    v-bind="attributes"
    :style="{
      objectFit: backgroundSize || 'cover',
      objectPosition: backgroundPosition || 'center',
    }"
    :key="(Builder.isEditing && imgSrc) || 'default-key'"
    :alt="altText"
    :src="imgSrc"
  />
</template>
<script>
import { Builder } from "@builder.io/sdk";

export default {
  name: "ImgComponent",

  props: [
    "backgroundSize",
    "backgroundPosition",
    "attributes",
    "imgSrc",
    "altText",
  ],

  data: () => ({ Builder }),
};
</script>
