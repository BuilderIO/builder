import { BuilderElement } from '@builder.io/sdk';
import { size, reduce, kebabCase } from 'lodash';
import { sizes, sizeNames } from '../constants/sizes';
import { Options } from '../interfaces/options';
import { Text } from '../components/text';
import { Columns } from '../components/columns';
import { Image } from '../components/image';

const components: { [key: string]: (block: BuilderElement) => string } = {
  Text,
  Columns,
  Image,
};

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

  const Component = block.component && components[block.component.name];

  if (block.component && !Component) {
    console.warn(`Could not find component: ${block.component.name}`);
  }

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
      ${(Component && Component(block)) || ''}
      ${
        block.children
          ? block.children.map((child: BuilderElement) => blockToLiquid(child, options)).join('\n')
          : ''
      }
    </${tag}>
    ${block.repeat ? '{% endfor %}' : ''}
    `;
}

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
