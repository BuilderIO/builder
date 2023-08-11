const TEXT_STYLE_KEYS = [
  "color",
  "whiteSpace",
  "direction",
  "hyphens",
  "overflowWrap"
];
const isTextStyle = (key) => {
  return TEXT_STYLE_KEYS.includes(key) || key.startsWith("font") || key.startsWith("text") || key.startsWith("letter") || key.startsWith("line") || key.startsWith("word") || key.startsWith("writing");
};
const extractTextStyles = (styles) => {
  const textStyles = {};
  Object.entries(styles).forEach(([key, value]) => {
    if (isTextStyle(key)) {
      textStyles[key] = value;
    }
  });
  return textStyles;
};
export {
  extractTextStyles
};
