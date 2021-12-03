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
import { isEditing } from '../functions/is-editing';

import { registerComponent } from '@builder.io/sdk-vue';

export default registerComponent(
  {
    name: 'builder-img-component',

    props: [
      'backgroundSize',
      'backgroundPosition',
      'attributes',
      'imgSrc',
      'altText',
    ],

    data: () => ({ isEditing }),
  },
  {
    name: 'Raw:Img',
    hideFromInsertMenu: true,
    builtIn: true,
    image:
      'https://firebasestorage.googleapis.com/v0/b/builder-3b0a2.appspot.com/o/images%2Fbaseline-insert_photo-24px.svg?alt=media&token=4e5d0ef4-f5e8-4e57-b3a9-38d63a9b9dc4',
    inputs: [
      {
        name: 'image',
        bubble: true,
        type: 'file',
        allowedFileTypes: ['jpeg', 'jpg', 'png', 'svg'],
        required: true,
      },
    ],
    noWrap: true,
    static: true,
  }
);
</script>
