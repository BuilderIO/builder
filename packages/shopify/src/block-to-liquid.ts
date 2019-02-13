import { BuilderElement, BuilderContent } from '@builder.io/sdk';
import reduce from 'lodash-es/reduce';
import kebabCase from 'lodash-es/kebabCase';
import size from 'lodash-es/size';

export function modelToLiquid(content: BuilderContent, modelName: string, options: Options = {}) {
  const blocks = content.data && content.data.blocks;

  const { html, css } = regexParse(
    `<div
      class="builder-content"
      builder-content-id=${content.id}
      data-builder-content-id=${content.id}
      data-builder-component=${modelName}
      builder-model=${modelName}
    >
      ${blocks ? blocks.map((block: BuilderElement) => blockToLiquid).join('') : ''}
    </div>`.replace(/\s+/, ' ')
  );

  if (options.extractCss) {
    return { html, css };
  }

  return { html: `<style type="text/css" class="builder-styles">${css}</style>` + html };
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

export interface Options {
  emailMode?: boolean;
  extractCss?: boolean;
}

export function blockToLiquid(block: BuilderElement, options: Options = {}): string {
  const css = blockCss(block, options);

  // TODO: utilities for all of this
  const attributes = mapToAttributes({
    ...block.properties,
    ['builder-id']: block.id,
    class: `builder-block ${block.id}${block.class ? ` ${block.class}` : ''}`,
    // TODO: style bindings and start animation styles
  });

  const tag = block.tagName || ((attributes as any).href ? 'a' : 'div');

  // Fragment? hm
  return `
    ${css.trim() ? `<style>${css}</style>` : ''}
    ${
      block.repeat
        ? `{% for ${block.repeat.collection || block.repeat.collection + 'Item'} in ${
            block.repeat.collection
          } %}`
        : ''
    }
    <${tag}${attributes ? ' ' + attributes : ''}>
      ${
        block.children
          ? block.children.map((child: BuilderElement) => blockToLiquid(child, options)).join('')
          : ''
      }
    </${tag}>
    ${block.repeat ? '{% endfor %}' : ''}
    `;
}

const regexParse = (html: string) => {
  const cssSet = new Set();
  const newHtml = html.replace(/<style.*?>([\s\S]*?)<\/style>/g, (match, cssString) => {
    cssSet.add(cssString);
    return '';
  });
  return {
    css: Array.from(cssSet.values())
      .join(' ')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/ \S+:\s+;/g, '')
      .replace(/\s+/g, ' ')
      .trim(),
    html: newHtml,
  };
};

interface StringMap {
  [key: string]: string | undefined | null;
}

function mapToAttributes(map: StringMap) {
  if (!size(map)) {
    return '';
  }
  return reduce(
    map,
    (memo, value, key) => {
      return memo + ` ${key}="${value}"`;
    },
    ''
  );
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
// TODO: apply style bindings and default animation
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
        Object.keys(self.responsiveStyles[size] as any).length
      ) {
        // TODO: this will not work as expected for a couple things that are handled specially,
        // e.g. width
        css += `\n@media only screen and (max-width: ${sizes[size].max}px) { \n${
          options.emailMode ? '.' : '.builder-block.'
        }${self.id + (options.emailMode ? '-subject' : '')} {${mapToCss(
          self.responsiveStyles[size] as any,
          4,
          options.emailMode
        )} } }`;
      }
    }
  }
  return css;
}
