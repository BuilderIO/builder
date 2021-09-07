<template>
  <div class="builder-text" v-html="text"></div>
</template>
<script>
import { registerComponent } from '@builder.io/sdk-vue';

export default registerComponent(
  {
    name: 'builder-text',

    props: ['text'],
  },
  {
    name: 'Text',
    static: true,
    builtIn: true,
    image:
      'https://firebasestorage.googleapis.com/v0/b/builder-3b0a2.appspot.com/o/images%2Fbaseline-text_fields-24px%20(1).svg?alt=media&token=12177b73-0ee3-42ca-98c6-0dd003de1929',
    inputs: [
      {
        name: 'text',
        type: 'html',
        required: true,
        autoFocus: true,
        bubble: true,
        defaultValue: 'Enter some text...',
      },
    ],
    defaultStyles: {
      lineHeight: 'normal',
      height: 'auto',
      textAlign: 'center',
    },
  }
);
</script>
