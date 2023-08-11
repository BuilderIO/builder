const getCssFromFont = font => {
  var _a, _b;
  const family = font.family + (font.kind && !font.kind.includes("#") ? ", " + font.kind : "");
  const name = family.split(",")[0];
  const url = (_b = font.fileUrl) != null ? _b : (_a = font == null ? void 0 : font.files) == null ? void 0 : _a.regular;
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
      }
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
};
const getFontCss = ({
  customFonts
}) => {
  var _a;
  return ((_a = customFonts == null ? void 0 : customFonts.map(font => getCssFromFont(font))) == null ? void 0 : _a.join(" ")) || "";
};
const getCss = ({
  cssCode,
  contentId
}) => {
  if (!cssCode) {
    return "";
  }
  if (!contentId) {
    return cssCode;
  }
  return (cssCode == null ? void 0 : cssCode.replace(/&/g, `div[builder-content-id="${contentId}"]`)) || "";
};
export { getCss, getFontCss }