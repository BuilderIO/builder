<template>
  <span
    :class="
      _classStringToObject(
        (this.attributes && this.attributes.class) ||
          (this.attributes && this.attributes.className)
      )
    "
    v-html="text || ''"
  ></span>
</template>
<script>
import { registerComponent } from '@builder.io/sdk-vue';

export default registerComponent(
  {
    name: 'builder-raw-text',

    props: ['attributes', 'text'],

    methods: {
      _classStringToObject(str) {
        const obj = {};
        if (typeof str !== 'string') {
          return obj;
        }
        const classNames = str.trim().split(/\s+/);
        for (const name of classNames) {
          obj[name] = true;
        }
        return obj;
      },
    },
  },
  {
    name: 'Builder:RawText',
    hideFromInsertMenu: true,
    builtIn: true,
    inputs: [{ name: 'text', bubble: true, type: 'longText', required: true }],
  }
);
</script>
