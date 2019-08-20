import { BuilderElement } from '@builder.io/sdk';
import { size, reduce, set, last } from 'lodash';
import { sizes, sizeNames } from '../constants/sizes';
import { Options } from '../interfaces/options';
import { Text } from '../components/text';
import { Columns } from '../components/columns';
import { Image } from '../components/image';
import { StringMap } from '../interfaces/string-map';
import { mapToCss } from './map-to-css';
import { fastClone } from './fast-clone';

const components: { [key: string]: (block: BuilderElement) => string } = {
  Text,
  Columns,
  Image,
};

export function blockToLiquid(json: BuilderElement, options: Options = {}): string {
  const block = fastClone(json);

  const styles: StringMap = {};

  if (block.bindings) {
    for (const key in block.bindings) {
      const value = block.bindings[key];
      if (!key || !value) {
        continue;
      }

      const valueString = `{{ ${value} }}`;
      if (key.startsWith('properties.') || !key.includes('.')) {
        if (!block.properties) {
          block.properties = {};
        }
        const name = key.startsWith('properties.') ? key.replace(/^\s*properties\s*\./, '') : key;
        set(block.properties, name, valueString);
      } else if (key.startsWith('component.options.') || key.startsWith('options.')) {
        const name = key.replace(/^.*?options\./, '');
        if (!block.component) {
          continue;
        }
        if (!block.component.options) {
          block.component.options = {};
        }
        set(block.component.options, name, valueString);
      } else if (key.startsWith('style.')) {
        const name = key.replace('style.', '');
        set(styles, name, valueString);
      }
    }
  }

  // TODO: bindings with {{}} as values
  const css = blockCss(block, options);

  // TODO: utilities for all of this
  const attributes = mapToAttributes({
    ...block.properties,
    ['builder-id']: block.id,
    class: `builder-block ${block.id}${block.class ? ` ${block.class}` : ''}`,
    ...(size(styles) && {
      style: mapToCss(styles, 0),
    }),
    // TODO: style bindings and start animation styles
  });

  const tag = block.tagName || ((attributes as any).href ? 'a' : 'div');

  const Component = block.component && components[block.component.name];

  if (block.component && !Component) {
    console.warn(`Could not find component: ${block.component.name}`);
  }

  const collectionName = block.repeat && last(
    (block.repeat.collection || '')
      .trim()
      .split('(')[0]
      .trim()
      .split('.')
  )


  // Fragment? hm
  return `
    ${css.trim() ? `<style>${css}</style>` : ''}
    ${
      block.repeat
        ? `{% for ${collectionName} in ${
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

function mapToAttributes(map: StringMap, bindings: StringMap = {}) {
  if (!size(map)) {
    return '';
  }
  return reduce(
    map,
    (memo, value, key) => {
      const bindingValue = bindings[key] || bindings['properties.key'];

      return memo + ` ${key}="${value}"`;
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
