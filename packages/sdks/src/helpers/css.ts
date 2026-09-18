import { camelToKebabCase } from '../functions/camel-to-kebab-case.js';
import type { BuilderBlock } from '../types/builder-block.js';
import { checkIsDefined } from './nullable.js';

const withBuilderImagePosition = (
  style: Partial<CSSStyleDeclaration> | undefined,
  fallback?: string
): Partial<CSSStyleDeclaration> | undefined => {
  const imagePosition = style?.objectPosition || fallback;
  return imagePosition
    ? ({
        ...style,
        '--builder-image-position': imagePosition,
      } as Partial<CSSStyleDeclaration>)
    : style;
};

export const getResponsiveStylesWithImagePosition = (
  styles: BuilderBlock['responsiveStyles'],
  isBuilderImage: boolean
): BuilderBlock['responsiveStyles'] =>
  isBuilderImage
    ? {
        ...styles,
        large: withBuilderImagePosition(styles?.large, 'initial'),
        medium: withBuilderImagePosition(styles?.medium),
        small: withBuilderImagePosition(styles?.small),
        xsmall: withBuilderImagePosition(styles?.xsmall),
      }
    : styles;

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
