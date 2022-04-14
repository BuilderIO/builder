<template>
  <component :is="style">{{ getInjectedStyles() }}</component>
</template>
<script>
export default {
  name: "render-styles",

  props: ["cssCode", "customFonts"],

  methods: {
    getCssFromFont(font) {
      // TODO: compute what font sizes are used and only load those.......
      const family =
        font.family +
        (font.kind && !font.kind.includes("#") ? ", " + font.kind : "");
      const name = family.split(",")[0];
      const url = font.fileUrl ?? font?.files?.regular;
      let str = "";

      if (url && family && name) {
        str += `
@font-face {
  font-family: "${family}";
  src: local("${name}"), url('${url}') format('woff2');
  font-display: fallback;
  font-weight: 400;
}
        `.trim();
      }

      if (font.files) {
        for (const weight in font.files) {
          const isNumber = String(Number(weight)) === weight;

          if (!isNumber) {
            continue;
          } // TODO: maybe limit number loaded

          const weightUrl = font.files[weight];

          if (weightUrl && weightUrl !== url) {
            str += `
@font-face {
  font-family: "${family}";
  src: url('${weightUrl}') format('woff2');
  font-display: fallback;
  font-weight: ${weight};
}
          `.trim();
          }
        }
      }

      return str;
    },
    getFontCss({ customFonts }) {
      // TODO: flag for this
      // if (!this.builder.allowCustomFonts) {
      //   return '';
      // }
      // TODO: separate internal data from external
      return (
        customFonts?.map((font) => this.getCssFromFont(font))?.join(" ") || ""
      );
    },
    getInjectedStyles() {
      return `
${this.cssCode}
${this.getFontCss({
  customFonts: this.customFonts,
})}`;
    },
  },
};
</script>
