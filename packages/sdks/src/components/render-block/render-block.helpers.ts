/**
 * https://developer.mozilla.org/en-US/docs/Glossary/Empty_element
 */
const EMPTY_HTML_ELEMENTS = [
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
];

export const isEmptyHtmlElement = (tagName: unknown) => {
  return (
    typeof tagName === 'string' &&
    EMPTY_HTML_ELEMENTS.includes(tagName.toLowerCase())
  );
};
