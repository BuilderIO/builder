import { camelToKebabCase } from '../functions/camel-to-kebab-case';

export const convertStyleMaptoCSS = (
  style: Partial<CSSStyleDeclaration>
): string => {
  const cssProps = Object.entries(style).map(([key, value]) => {
    if (typeof value === 'string') {
      return `${camelToKebabCase(key)}: ${value};`;
    }
  });

  return cssProps.join('\n');
};
