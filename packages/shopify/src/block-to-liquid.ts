import { BuilderElement, BuilderContent } from '@builder.io/sdk';
import reduce from 'lodash-es/reduce';
import kebabCase from 'lodash-es/kebabCase';
import dedent from 'dedent'

export function modelToLiquid(content: BuilderContent, modelName: string, options?: Options) {
  const blocks = content.data && content.data.blocks;
  return dedent`<div
    className="builder-content"
    builder-content-id=${content.id}
    builder-model=${content.modelName}
  >
    ${blocks ? blocks.map((block: BuilderElement) => blockToLiquid).join('') : ''}
  </div>`;
}

// TODO: move to core
export type Size = 'large' | 'medium' | 'small' | 'xsmall';
export const sizeNames: Size[] = ['xsmall', 'small', 'medium', 'large'];
const sizes = {
  xsmall: {
    min: 0,
    default: 0,
    max: 0,
  },
  small: {
    min: 320,
    default: 321,
    max: 640,
  },
  medium: {
    min: 641,
    default: 642,
    max: 991,
  },
  large: {
    min: 990,
    default: 991,
    max: 1200,
  },
  getWidthForSize(size: Size) {
    return this[size].default;
  },
  getSizeForWidth(width: number) {
    for (const size of sizeNames) {
      const value = this[size];
      if (width <= value.max) {
        return size;
      }
    }
    return 'large';
  },
};

interface Options {
  emailMode?: boolean;
}

export function blockToLiquid(block: BuilderElement, options: Options = {}) {}

interface StringMap {
  [key: string]: string | undefined | null;
}
function mapToCss(map: StringMap, spaces = 2, important = false) {
  return reduce(
    map,
    (memo, value, key) => {
      return (
        memo +
        (value && value.trim()
          ? `\n${' '.repeat(spaces)}${kebabCase(key)}: ${value + (important ? ' !important' : '')};`
          : '')
      );
    },
    ''
  );
}

// TODO: make these core functions and share with react, vue, etc
function blockCss(block: BuilderElement, options: Options = {}) {
  // TODO: handle style bindings
  const self = block;

  const baseStyles: Partial<CSSStyleDeclaration> = {
    ...(self.responsiveStyles && self.responsiveStyles.large),
  };

  let css = options.emailMode
    ? ''
    : `.builder-block.${self.id} {${mapToCss(baseStyles as StringMap)}}`;

  const reversedNames = sizeNames.slice().reverse();
  if (self.responsiveStyles) {
    for (const size of reversedNames) {
      if (options.emailMode && size === 'large') {
        continue;
      }
      if (
        size !== 'large' &&
        size !== 'xsmall' &&
        self.responsiveStyles[size] &&
        Object.keys(self.responsiveStyles[size]).length
      ) {
        // TODO: this will not work as expected for a couple things that are handled specially,
        // e.g. width
        css += `\n@media only screen and (max-width: ${sizes[size].max}px) { \n${
          options.emailMode ? '.' : '.builder-block.'
        }${self.id + (options.emailMode ? '-subject' : '')} {${mapToCss(
          self.responsiveStyles[size],
          4,
          options.emailMode
        )} } }`;
      }
    }
  }
  return css;
}
