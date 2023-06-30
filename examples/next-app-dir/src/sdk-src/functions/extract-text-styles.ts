const TEXT_STYLE_KEYS = [
  'color',
  'whiteSpace',
  'direction',
  'hyphens',
  'overflowWrap',
];

/**
 * Check if the key represent a CSS style property that applies to text
 * See MDN docs for refrence of what properties apply to text.
 * https://developer.mozilla.org/en-US/docs/Learn/CSS/Styling_text/Fundamentals#summary
 */
const isTextStyle = (key: string) => {
  return (
    TEXT_STYLE_KEYS.includes(key) ||
    key.startsWith('font') ||
    key.startsWith('text') ||
    key.startsWith('letter') ||
    key.startsWith('line') ||
    key.startsWith('word') ||
    key.startsWith('writing')
  );
};

/**
 * Extract styles that apply to text from a style object.
 */
export const extractTextStyles = (styles: Partial<CSSStyleDeclaration>) => {
  const textStyles: Partial<CSSStyleDeclaration> = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Object.entries(styles).forEach(([key, value]: [any, any]) => {
    if (isTextStyle(key)) {
      textStyles[key] = value;
    }
  });

  return textStyles;
};
