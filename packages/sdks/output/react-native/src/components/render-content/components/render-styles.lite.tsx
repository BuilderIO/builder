import * as React from "react";
import { View, StyleSheet, Image, Text } from "react-native";
import { TARGET } from "../../../constants/target";

export default function RenderStyles(props) {
  function getCssFromFont(font) {
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
  }

  function getFontCss({ customFonts }) {
    // TODO: flag for this
    // if (!builder.allowCustomFonts) {
    //   return '';
    // }
    // TODO: separate internal data from external
    return customFonts?.map((font) => getCssFromFont(font))?.join(" ") || "";
  }

  function injectedStyles() {
    return `
${props.cssCode || ""}
${getFontCss({
  customFonts: props.customFonts,
})}`;
  }

  function injectedStyleScript() {
    // NOTE: we have to obfusctate the name of the tag due to a limitation in the svelte-preprocessor plugin.
    // https://github.com/sveltejs/vite-plugin-svelte/issues/315#issuecomment-1109000027
    return `<sty${""}le>${injectedStyles()}</sty${""}le>`;
  }

  return (
    <>
      {TARGET === "svelte" ? (
        <>
          <></>
        </>
      ) : (
        <View dangerouslySetInnerHTML={{ __html: "injectedStyles()" }} />
      )}
    </>
  );
}
