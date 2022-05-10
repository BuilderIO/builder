<template>
  <img
    v-bind="attributes"
    :style="{
      objectFit: backgroundSize || 'cover',
      objectPosition: backgroundPosition || 'center',
    }"
    :key="(isEditing() && imgSrc) || 'default-key'"
    :alt="altText"
    :src="imgSrc"
  />
</template>
<script>
import { isEditing } from "../../functions/is-editing.js";

export default {
  name: "builder-img-component",

  props: [
    "backgroundSize",
    "backgroundPosition",
    "attributes",
    "imgSrc",
    "altText",
  ],

  data: () => ({ isEditing }),
};
</script>
