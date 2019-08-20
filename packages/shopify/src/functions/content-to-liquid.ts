import { BuilderElement, BuilderContent } from '@builder.io/sdk';
import { format, Options as PrettierOptions } from 'prettier';
import { blockToLiquid } from './block-to-liquid';
import { Options } from '../interfaces/options';
import { fastClone } from './fast-clone';
import { convertTsToLiquid } from '../transformers/convert';

const unescapeHtml = (html: string) => html.replace(/&apos;/g, "'").replace(/&quot;/g, '"');

export const convertTemplateLiteralsToTags = (liquid: string) => {
  let current = liquid;
  let latest = liquid;
  let updated = true;
  while (updated) {
    updated = false;
    latest = current
      // Oh lawdy...
      // Remove binding open with template literal with liquid directly inside - '{{ `{%' or '{{ `{{'
      .replace(/{{\s*`{([%{])/g, ' {$1 ')
      // Remove binding close with template literal with liquid directly inside - '%}` }}' or '}}` }}'
      .replace(/([%}])}`\s*}}/g, ' $1} ')
      // Literal explressions ${...} -> ...
      .replace(/\${([^}]+?)}/g, '$1')
      // Remove the string tags now
      .replace(/`/g, '')
      .replace(/\| img_url;/g, '| img_url:')
      // TODO: put in TS transforms
      .replace(/src="{{ images_item }}"/g, 'src="{{ images_item | img_url: "large" }}"')
      // FIXME: why this happening? aka TS is putting parans around for (thing in things) but liquid requires none
      .replace(/{%\s*for\s*\((.*?\s*in\s*.*?)\)\s*%}/g, '{% for $1 %}');

    if (latest !== current) {
      current = latest;
      updated = true;
    }
  }
  return latest;
};

const liquidExpression = (expression: string) => convertTsToLiquid(unescapeHtml(expression));
// TODO: move to transformer. Will break if ' + ' is in a string, though
// right now this seems very unusual and unlikely to occur
// .replace(/([\s\S]+?)\s+\+\s+([\s\S]+?)/g, '$1 | append: $2');

const liquidToHandlebars = (liquid: string) =>
  liquid
    .replace(/{{\s*([^}]+?)\s*}}/g, "{{ liquid '$1' }}")
    .replace(/{%\s*([^}]+?)\s*%}/g, "{{ liquid-block '$1' }}");

const handlebarsToLiquid = (handlebars: string) =>
  convertTemplateLiteralsToTags(
    handlebars
      .replace(
        /{{\s*liquid\s*['"]([\s\S]+?)['"]\s*}}/g,
        (match, group) => `{{ ${liquidExpression(group)} }}`
      )
      .replace(
        /{{\s*liquid-block\s*['"]([\s\S]+?)['"]\s*}}/g,
        (match, group) => `{% ${liquidExpression(group)} %}`
      )
  );

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

export function contentToLiquid(json: BuilderContent, modelName: string, options: Options = {}) {
  const content = fastClone(json);

  if (content.data && content.data.blocksString) {
    content.data.blocks = JSON.parse(content.data.blocksString);
    delete content.data.blocksString;
  }
  const blocks = content.data && content.data.blocks;

  let { html, css } = regexParse(
    `<div
      class="builder-content"
      builder-content-id="${content.id}"
      data-builder-content-id="${content.id}"
      data-builder-component="${modelName}"
      builder-model="${modelName}"
    >
      ${
        blocks
          ? blocks.map((block: BuilderElement) => blockToLiquid(block, options)).join('\n')
          : ''
      }
    </div>`.replace(/\s+/, ' ')
  );

  css = prettify(css, {
    ...options.prettierOptions,
    parser: 'css',
  });

  if (!options.extractCss) {
    html = `<style type="text/css" class="builder-styles">${css}</style>` + html;
    css = '';
  }

  // Convert to handlebars and back because it is similar to liquid and has a prettier
  // formatter for it
  html = handlebarsToLiquid(
    prettify(liquidToHandlebars(html), {
      ...options.prettierOptions,
      parser: 'glimmer' as any,
    })
  );

  return { html, css: css || undefined };
}
