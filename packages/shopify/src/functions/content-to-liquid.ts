import { BuilderElement, BuilderContent } from '@builder.io/sdk';
import { format, Options as PrettierOptions } from 'prettier';
import { reduce, kebabCase, size } from 'lodash';
import { blockToLiquid } from './block-to-liquid';
import { Options } from '../interfaces/options';

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

const prettify = (str: string, options?: PrettierOptions) =>
  format(str, {
    ...options,
  });

export function contentToLiquid(content: BuilderContent, modelName: string, options: Options = {}) {
  const blocks = content.data && content.data.blocks;

  let { html, css } = regexParse(
    `<div
      class="builder-content"
      builder-content-id=${content.id}
      data-builder-content-id=${content.id}
      data-builder-component=${modelName}
      builder-model=${modelName}
    >
      ${blocks ? blocks.map((block: BuilderElement) => blockToLiquid(block)).join('\n') : ''}
    </div>`.replace(/\s+/, ' ')
  );

  if (!options.extractCss) {
    html = `<style type="text/css" class="builder-styles">${css}</style>` + html;
    css = '';
  }
  html = prettify(html, {
    ...options.prettierOptions,
    parser: 'html',
  });
  css = prettify(css, {
    ...options.prettierOptions,
    parser: 'css',
  });

  return { html, css: css || undefined };
}
