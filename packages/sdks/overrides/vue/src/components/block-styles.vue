<template>
  <component :is="'style'" v-html="getCss()"></component>
</template>
<script>
function camelToKebabCase(string) {
  return string.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}

export default {
  props: ['block'],
  methods: {
    getCss() {
      // TODO: media queries
      const styleObject = this.block.responsiveStyles?.large;
      if (!styleObject) {
        return '';
      }

      let str = `.${this.block.id} {`;

      for (const key in styleObject) {
        const value = styleObject[key];
        if (typeof value === 'string') {
          str += `${camelToKebabCase(key)}: ${value};`;
        }
      }

      str += '}';

      return str;
    },
  },
};
</script>
