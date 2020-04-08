import { BuilderContent, BuilderElement } from '@builder.io/sdk';
import * as prettier from 'prettier/standalone';
import * as tsParser from 'prettier/parser-typescript';
import { last, escapeRegExp, capitalize } from 'lodash';

interface BuilderToJsxOptions {}

const tryFormat = (code: string) => {
  try {
    return prettier.format(code, {
      parser: 'typescript',
      plugins: [tsParser],
    });
  } catch (err) {
    console.warn('Could not format code:', err, code);
    return code;
  }
};

const size = (obj?: object) => Boolean(obj && Object.keys(obj).length);

type Json = string | boolean | null | JsonObject | JsonArray;
type JsonArray = Json[];
type JsonObject = { [key: string]: Json | undefined };

const stringify = (json: Json) => {
  let str = '';
  switch (typeof json) {
    case 'string':
    case 'boolean':
    case 'number':
      str += JSON.stringify(json);
      break;
    case 'object':
      if (!json) {
        str += JSON.stringify(json);
      } else if (Array.isArray(json)) {
        str += '[';
        str += json.map(item => stringify(item)).join(',');
        str += ']';
      } else if ((json as any)['@type'] === '@builder.io/sdk:Element') {
        str += blockToJsx(json as any);
      } else {
        str += '{';
        for (const key in json) {
          str += JSON.stringify(key);
          str += ':';
          str += stringify(json[key] as any);
          str += ',';
        }
        str += '}';
      }
  }
  return str;
};

export const contentToJsx = (content: BuilderContent, options?: BuilderToJsxOptions) => {
  let str = 'export default (<>';
  str += content.data?.blocks?.map(item => blockToJsx(item, options)).join('\n') || '';
  str += '</>)';

  return tryFormat(str);
};

export const blockToJsx = (
  block: BuilderElement & { code?: any },
  options?: BuilderToJsxOptions
) => {
  const tagName = block.tagName || 'div';

  let str = `<${tagName}`;

  str += ` uid="${block.id?.replace('builder-', '')}"`;

  for (const property in block.properties) {
    if (block.bindings?.[`properties.${property}`]) {
      continue;
    }
    const propertyName = property === 'class' ? 'className' : property;
    str += ` ${propertyName}="${block.properties[property]}"`;
  }

  if (block.responsiveStyles) {
    const cssObj: any = block.responsiveStyles?.large || {};
    for (const sizeName of ['medium', 'small', 'xsmall']) {
      const val = size((block.responsiveStyles as any)?.[sizeName]);
      if (val) {
        cssObj[sizeName] = val;
      }
    }
    if (size(cssObj)) {
      str += ` css={${JSON.stringify(cssObj)}}`;
    }
  }

  for (const property in block.bindings) {
    const value = block.bindings[property].replace(/context\.shopify\.liquid\.render/g, 'liquid');
    // TODO: handle style bindings, component options
    // TEMP HACK
    if (!property.includes('.') || property.startsWith('properties.')) {
      const useProperty = property === 'class' ? 'className' : last(property.split('.'));
      str += ` ${useProperty}={${value}}`;
    }
  }

  if (block.repeat) {
    // TODO: same logic as react lib for figuring out item names
    const itemName = block.repeat.itemName || last(block.repeat.collection.split('.') + 'Item');
    str += ` for="${itemName} of ${block.repeat.collection}"`;
  }

  for (const property in { ...block.actions, ...block.code?.actions }) {
    const value = block.code?.actions?.[property] || block.actions?.[property];
    str += ` on${capitalize(property)}={() => ${value}}`;
  }

  str += '>';

  // TDOO: will need to transform at some point and reference
  const ComponetnName = last(block.component?.name.split(/[^a-z0-9]/gi));

  // TODO: handle noWrap
  if (block.component) {
    // TODO: turn into references
    str += `<${ComponetnName}`;

    for (const property in block.component.options) {
      if (block.bindings?.[`component.options.${property}`]) {
        continue;
      }
      const propertyName = property === 'class' ? 'className' : property;
      const value = block.component.options[property];

      const stringifiedValue = stringify(value);

      const finalValue = stringifiedValue.replace(/context\.shopify\.liquid\.render/g, 'liquid');
      str += ` ${propertyName}={${finalValue}}`;
    }

    for (const property in { ...block.bindings, ...block.code?.bindings }) {
      const value = (block.code?.bindings?.[property] || block.bindings?.[property]).replace(
        /context\.shopify\.liquid/g,
        'liquid'
      );
      // TODO: handle style bindings, component options
      if (property.startsWith('options.') || property.startsWith('component.options.')) {
        const useProperty = property === 'class' ? 'className' : last(property.split('.'));

        str += ` ${useProperty}={${value}}`;
      }
    }
    str += '>';
  }

  str += block.children?.map(item => blockToJsx(item, options)).join('\n') || '';

  if (block.component) {
    str += `</${ComponetnName}>`;
  }

  str += `</${tagName}>`;

  return str;
};
