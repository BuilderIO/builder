import { BuilderElement, BuilderContent } from '@builder.io/sdk';
import { format } from 'prettier/standalone';
import * as parserCss from 'prettier/parser-postcss';
import * as parserGlimmer from 'prettier/parser-glimmer';
import * as parserHtml from 'prettier/parser-html';
import { Options as PrettierOptions } from 'prettier';
import { blockToLiquid } from './block-to-liquid';
import { Options } from '../interfaces/options';
import { fastClone } from './fast-clone';
import {
  convertTsToLiquid,
  TEMPLATE_START_TOKEN,
  PART_START_TOKEN,
  PART_END_TOKEN,
  TEMPLATE_END_TOKEN,
} from '../transformers/convert';
import * as CleanCSS from 'clean-css';
import * as csso from 'csso';

const unescapeHtml = (html: string) => html.replace(/&apos;/g, "'").replace(/&quot;/g, '"');

function getCssFromFont(font: any) {
  // TODO: compute what font sizes are used and only load those.......
  const family = font.family + (font.kind && !font.kind.includes('#') ? ', ' + font.kind : '');
  const name = family.split(',')[0];
  const url = font.fileUrl ? font.fileUrl : font.files && font.files.regular;
  let str = '';
  if (url && family && name) {
    str += `
@font-face {
font-family: ${family};
src: local("${name}"), url('${url}') format('woff2');
font-display: swap;
font-weight: 400;
}
      `.trim();
  }

  if (font.files) {
    for (const weight in font.files) {
      // TODO: maybe limit number loaded
      const weightUrl = font.files[weight];
      if (weightUrl && weightUrl !== url) {
        str += `
@font-face {
font-family: ${family};
src: url('${weightUrl}') format('woff2');
font-display: swap;
font-weight: ${weight};
}
        `.trim();
      }
    }
  }
  return str;
}

function getFontCss(data: any) {
  // TODO: separate internal data from external
  return (
    data.customFonts &&
    data.customFonts.length &&
    data.customFonts.map((font: any) => getCssFromFont(font)).join(' ')
  );
}

function getCss(data: any) {
  // .replace(/([^\s]|$)&([^\w])/g, '$1' + '.some-selector' + '$2')
  return (data.cssCode || '') + (getFontCss(data) || '');
}

export const convertTemplateLiteralsToTags = (liquid: string, options: Options = {}) => {
  let current = liquid;
  let latest = liquid;
  let updated = true;
  while (updated) {
    updated = false;
    latest = current
      // Template interpolate tokens
      .replace(new RegExp('`' + TEMPLATE_START_TOKEN, 'g'), '')
      .replace(new RegExp(PART_START_TOKEN + '\\${', 'g'), '')
      .replace(new RegExp('}' + PART_END_TOKEN, 'g'), '')
      .replace(new RegExp(TEMPLATE_END_TOKEN + '`', 'g'), '')
      // HACK: get this into the appropriate place
      .replace(/context\.shopify\.liquid\.get\(\s*"(.*?)"\s*state\)/g, '$1')
      // TODO: can have double quotes in value
      .replace(/{{\s*context\.shopify\.liquid\.render\(("|&quot;)(.*?)("|&quot;),\s*state\)\s*}}/g, '$2');

    if (options.convertShopifyBindings !== false) {
      latest = latest
        // Sometimes we have to replace {{ .. }} bindings with {% ... %}
        // For ease, swap directly inside, but we need to remove the surrounding tags
        // when we see {{ {% ... %} }}
        .replace(/{{\s*{%/g, '{%')
        .replace(/%}\s*}}/g, '%}')

        // .replace(/{{[^}]?+([!=]=)[^}+]?}}/g, (match, group) => {
        //   return match;
        // })

        // Fix this in the compiler
        .replace(/\| img_url;\s*/g, `| img_url: `)

        // TODO: put into transforms
        .replace(/src="{{ images_item }}"/g, `src="{{ images_item | img_url: 'master' }}"`)

        .replace(/(state\.)?\$index/g, 'forloop.index')

        // Why...
        .replace(/{%\s*unless\s*;\s*/g, '{% unless ')

        // TS is putting parans around for (thing in things) but liquid requires none
        // FIXME: why this happening?
        .replace(/{%\s*for\s*\((.*?\s*in\s*.*?)\)\s*%}/g, '{% for $1 %}');
    }

    if (latest !== current) {
      current = latest;
      updated = true;
    }
  }
  return latest;
};

const liquidExpression = (expression: string, options: Options = {}) => {
  if (options.convertShopifyBindings === false) {
    return unescapeHtml(expression);
  }
  return convertTsToLiquid(unescapeHtml(expression));
};
// TODO: move to transformer. Will break if ' + ' is in a string, though
// right now this seems very unusual and unlikely to occur
// .replace(/([\s\S]+?)\s+\+\s+([\s\S]+?)/g, '$1 | append: $2');

const liquidToHandlebars = (liquid: string) =>
  liquid
    .replace(/{{\s*([^}]+?)\s*}}/g, "{{ liquid '$1' }}")
    .replace(/{%\s*([^}]+?)\s*%}/g, "{{ liquid-block '$1' }}");

const handlebarsToLiquid = (handlebars: string, options: Options = {}) =>
  convertTemplateLiteralsToTags(
    handlebars
      .replace(
        /{{\s*liquid\s*['"]([\s\S]+?)['"]\s*}}/g,
        (match, group) => `{{ ${liquidExpression(group, options)} }}`
      )
      .replace(
        /{{\s*liquid-block\s*['"]([\s\S]+?)['"]\s*}}/g,
        (match, group) => `{% ${liquidExpression(group, options)} %}`
      ),
    options
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

const prettify = (str: string, options?: PrettierOptions) => {
  try {
    return format(str, {
      ...options,
      plugins: [parserGlimmer, parserHtml, parserCss].concat(options?.plugins || []), // TODO: how replace too
    });
  } catch (err) {
    console.warn('Could not format code', err, { code: str });
  }

  return str;
};

export function contentToLiquid(json: BuilderContent, modelName: string, options: Options = {}) {
  const content = fastClone(json);

  if (content.data && content.data.blocksString) {
    content.data.blocks = JSON.parse(content.data.blocksString);
    delete content.data.blocksString;
  }
  const blocks = content.data && content.data.blocks;

  // TODO: optimize CSS to remove redundancy
  let { html, css } = regexParse(
    `
  <div class="builder-component" data-name="${modelName}">
    <div
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
    </div>
  </div>
    `.replace(/\s+/, ' ')
  );

  css = getCss(json.data) + css;

  // Optimize CSS (todo: option to not do)
  const minResult = new CleanCSS({
    level: 1,
  }).minify(css);

  css = minResult.styles;

  const cssOutput = csso.minify(css, {
    restructure: true,
  });

  css = cssOutput.css;

  css = prettify(css, {
    ...options.prettierOptions,
    parser: 'css',
  });

  if (!options.extractCss) {
    html =
      `<style type="text/css" class="builder-styles builder-api-styles">${
        css
          // Add a newlinw space between each CSS block
          .replace(/\n}/g, '\n}\n')
          // Add two spaces before each line that has content (indent into the <style> tag)
          .split('\n')
          .map(item => (item.length ? '  ' + item : item))
          .join('\n')
        // Close style tag and add html
      }</style>` + html;
    css = '';
  }

  const dateString = new Date().toUTCString();
  html =
    // `\n<!-- ***** Generated by Builder.io on ${dateString} ***** -->\n\n` +
    html + `\n\n<!-- /**** Generated by Builder.io on ${dateString} *****/ -->\n`;

  // Convert to handlebars and back because it is similar to liquid and has a prettier
  // formatter for it
  html = handlebarsToLiquid(
    prettify(liquidToHandlebars(html), {
      ...options.prettierOptions,
      // parser: 'glimmer' as any,
      parser: 'html',
    }),
    options
  );

  html =
    `<!--
  ****
  ****   ___                       _          _   ___        ___      _ _    _          _     
  ****  / __|___ _ _  ___ _ _ __ _| |_ ___ __| | | _ )_  _  | _ )_  _(_) |__| |___ _ _ (_)___ 
  **** | (_ / -_) ' \\/ -_) '_/ _\` |  _/ -_) _\` | | _ \\ || | | _ \\ || | | / _\` / -_) '_|| / _ \\
  ****  \\___\\___|_||_\\___|_| \\__,_|\\__\\___\\__,_| |___/\\_, | |___/\\_,_|_|_\\__,_\\___|_|(_)_\\___/
  ****                                                |__/    
  ****                                
  **** This content was created and managed by Builder.io
  ****
  **** Be sure you have access to this account in Builder.io and edit this page at:
  **** https://builder.io/content/${json.id}
  ****
  **** If you are a developer doing work on this site, see this guide on using Builder.io for Shopify developers:
  **** https://builder.io/c/docs/guides/shopify-developers
  ****
  **** Last updated: ${dateString}
  ****
-->

` + html;

  return {
    html,
    css: css || undefined,
    dataHtml: `<script type="application/json" data-builder-state="${content.id}">
  { "objects": {{ objects | json }}, "address": {{ address | json }}, "article": {{ article | json }}, "block": {{ block | json }}, "blog": {{ blog | json }}, "cart": {{ cart | json }}, "checkout": {{ checkout | json }}, "collection": {{ collection | json }}, "comment": {{ comment | json }}, "currency": {{ currency | json }}, "current-page": {{ current | json }}, "current_tags": {{ current_tags | json }}, "customer": {{ customer | json }}, "customer_address": {{ customer_address | json }}, "discount": {{ discount | json }}, "discount_allocation": {{ discount_allocation | json }}, "discount_application": {{ discount_application | json }}, "font": {{ font | json }}, "for-loops": {{ for | json }}, "form": {{ form | json }}, "fulfillment": {{ fulfillment | json }}, "gift_card": {{ gift_card | json }}, "handle": {{ handle | json }}, "image": {{ image | json }}, "line_item": {{ line_item | json }}, "link": {{ link | json }}, "linklist": {{ linklist | json }}, "metafield": {{ metafield | json }}, "order": {{ order | json }}, "page": {{ page | json }}, "page_description": {{ page_description | json }}, "page_title": {{ page_title | json }}, "paginate": {{ paginate | json }}, "part": {{ part | json }}, "policy": {{ policy | json }}, "product": {{ product | json }}, "product_option": {{ product_option | json }}, "recommendedProducts": [{% for product in recommendations.products %}{{ product | json }}{% unless forloop.last %},{% endunless %}{% endfor %}], "request": {{ request | json }}, "routes": {{ routes | json }}, "script": {{ script | json }}, "search": {{ search | json }}, "section": {{ section | json }}, "shipping_method": {{ shipping_method | json }}, "shop": {{ shop | json }}, "shop_locale": {{ shop_locale | json }}, "tablerow": {{ tablerow | json }}, "tax_line": {{ tax_line | json }}, "template": {{ template | json }}, "theme": {{ theme | json }}, "transaction": {{ transaction | json }}, "unit_price_measurement": {{ unit_price_measurement | json }}, "variant": {{ variant | json }}, "deprecated_objects": {{ deprecated_objects | json }} }
</script>`,
  };
}
