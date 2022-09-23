import { camelToKebabCase } from '../functions/camel-to-kebab-case.js';

const convertStyleMaptoCSS = (style: Partial<CSSStyleDeclaration>): string => {
  const cssProps = Object.entries(style).map(([key, value]) => {
    if (typeof value === 'string') {
      return `${camelToKebabCase(key)}: ${value};`;
    }
  });

  return cssProps.join('\n');
};

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
    ${convertStyleMaptoCSS(styles)}
  }`;

  if (mediaQuery) {
    return `${mediaQuery} {
      ${cssClass}
    }`;
  } else {
    return cssClass;
  }
};
