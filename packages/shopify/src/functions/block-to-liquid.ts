import { BuilderElement } from '@builder.io/sdk';
import { size, reduce, set, last, snakeCase } from 'lodash';
import { sizes, sizeNames } from '../constants/sizes';
import { Options } from '../interfaces/options';
import { StringMap } from '../interfaces/string-map';
import { mapToCss } from './map-to-css';
import { fastClone } from './fast-clone';
import { getComponentInfo } from '../constants/components';

import '../components/text';
import '../components/columns';
import '../components/image';
import '../components/assign';
import '../components/section';
import '../components/button';
import '../components/symbol';
import '../components/custom-code';
import '../components/forms/form';
import '../components/forms/label';
import '../components/forms/input';
import '../components/forms/submit-button';
import '../components/widgets/accordion';
import '../components/widgets/carousel';

const camelCaseToSnakeCase = (str?: string) =>
  str ? str.replace(/([A-Z])/g, g => `_${g[0].toLowerCase()}`) : '';

const escaleHtml = (str: string) => str.replace(/'/g, '&apos;').replace(/"/g, '&quot;');

// TODO: move most or all of this to transformers and functions
const convertBinding = (binding: string, options: Options) => {
  let value = binding;

  if (value.replace(/\s/g, '').includes('shopify.liquid')) {
    // TODO: handle escaped \" don't cutoff the string hm or encode it... __QUOT__ or so
    // state.shopify.liquid.get('...') -> ...
    value = value.replace(
      /state\s*\.\s*shopify\s*\.\s*liquid\s*\.\s*get\s*\(\s*"([^"]+)"\s*\)/g,
      '$1'
    );
  }

  return value;
};

export function blockToLiquid(json: BuilderElement, options: Options = {}): string {
  const block = fastClone(json);

  const styles: StringMap = {};

  if (block.bindings) {
    for (const key in block.bindings) {
      let value = block.bindings[key];
      if (!key || !value || key === 'hide') {
        continue;
      }

      value = convertBinding(value, options);

      if (value.includes(';')) {
        console.debug('Skipping binding', value.replace(/\s+/g, ' '));
        value = "''";
        // continue;
      }

      const htmlEscapedValue = escaleHtml(value);
      const valueString = `{{ ${htmlEscapedValue} }}`;
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

  const tag = block.tagName || (block.properties && block.properties.href ? 'a' : 'div');

  const componentInfo = block.component && getComponentInfo(block.component.name);

  if (block.component && !componentInfo) {
    console.warn(`Could not find component: ${block.component.name}`);
  }

  let collectionName =
    block.repeat &&
    last(
      (block.repeat.collection || '')
        .trim()
        .split('(')[0]
        .trim()
        .split('.')
    );

  if (collectionName) {
    collectionName = convertBinding(collectionName, options);
  }

  console.log('latest?')

  // Fragment? hm
  return `
    ${css.trim() ? `<style>${css}</style>` : ''}
    ${
      block.repeat && block.repeat.collection
        ? `{% for ${block.repeat.itemName || collectionName + '_item'} in ${escaleHtml(
            convertBinding(block.repeat.collection, options).split('(')[0]
          )} %}`
        : ''
    }
    ${
      block.bindings && block.bindings.hide
        ? `{% unless  ${
            block.bindings.hide.includes(';')
              ? 'false'
              : escaleHtml(convertBinding(block.bindings.hide, options))
          } %}`
        : ''
    }
    ${
      block.bindings && block.bindings.show
        ? `{% if  ${
            block.bindings.show.includes(';')
              ? 'false'
              : escaleHtml(convertBinding(block.bindings.show, options))
          } %}`
        : ''
    }
    ${
      componentInfo && componentInfo.noWrap
        ? componentInfo.component(block, options, attributes)
        : `
    <${tag}${attributes ? ' ' + attributes : ''}>
      ${(componentInfo && componentInfo.component(block, options)) ||
        (block.children &&
          block.children
            .map((child: BuilderElement) => blockToLiquid(child, options))
            .join('\n')) ||
        ''}
    </${tag}>`
    }
    ${block.bindings && block.bindings.hide ? '{% endunless %}' : ''}
    ${block.bindings && block.bindings.show ? '{% endif %}' : ''}
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
