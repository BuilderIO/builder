import { camelToKebabCase } from '../functions/camel-to-kebab-case.js';
import { checkIsDefined } from './nullable.js';

export const convertStyleMapToCSSArray = (
  style: Partial<CSSStyleDeclaration>
): string[] => {
  const cssProps = Object.entries(style).map(([key, value]) => {
    if (typeof value === 'string') {
      return `${camelToKebabCase(key)}: ${value};`;
    } else {
      return undefined;
    }
  });

  return cssProps.filter(checkIsDefined);
};

export const convertStyleMapToCSS = (
  style: Partial<CSSStyleDeclaration>
): string => convertStyleMapToCSSArray(style).join('\n');

export const createCssClass = ({
  mediaQuery,
  className,
  styles,
}: {
  mediaQuery?: string;
  className: string;
  styles: Partial<CSSStyleDeclaration>;
}) => {
  const cssClass = `.${className} {
    ${convertStyleMapToCSS(styles)}
  }`;

  if (mediaQuery) {
    return `${mediaQuery} {
      ${cssClass}
    }`;
  } else {
    return cssClass;
  }
};
