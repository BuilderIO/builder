/**
 * https://developer.mozilla.org/en-US/docs/Glossary/Empty_element
 */
const EMPTY_HTML_ELEMENTS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'keygen',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

export const isEmptyElement = (tagName: any): boolean => {
  return (
    typeof tagName === 'string' &&
    EMPTY_HTML_ELEMENTS.has(tagName.toLowerCase())
  );
};
