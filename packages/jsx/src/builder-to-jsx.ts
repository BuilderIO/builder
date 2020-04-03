import { BuilderContent, BuilderElement } from '@builder.io/sdk';
import { format } from 'prettier';

interface BuilderToJsxOptions {}

const tryFormat = (code: string) => {
  try {
    return format(code);
  } catch (err) {
    console.warn('Could not format code:', code);
    return code;
  }
};

export const contentToJsx = (content: BuilderContent, options?: BuilderToJsxOptions) => {
  const str = content.data.blocks?.map(item => blockToJsx(item, options)).join('\n') || '';

  return tryFormat(str);
};

export const blockToJsx = (block: BuilderElement, options?: BuilderToJsxOptions) => {
  const tagName = block.tagName || 'div';

  let str = `<${tagName}`;

  for (const property in block.properties) {
    str += ` ${property}="${block.properties[property]}"`;
  }

  for (const property in block.component?.options) {
    const value = block.component.options[property];
    str += ` ${property}=${JSON.stringify(value)}`;
  }

  for (const property in block.bindings) {
    const value = block.bindings[property];
    str += ` ${property}={${value}}`;
  }

  for (const property in block.actions) {
    const value = block.actions[property];
    str += ` ${property}={() => ${value}}`;
  }

  str += '>';
  str += block.children?.map(item => blockToJsx(item, options)).join('\n') || '';
  str += `</${tagName}>`;

  return str;
};
