import { BuilderElement, BuilderContent } from '@builder.io/sdk';
import { format } from 'prettier/standalone';
import * as parserCss from 'prettier/parser-postcss';
import * as parserHtml from 'prettier/parser-html';
import { Options as PrettierOptions } from 'prettier';
import { blockToLiquid } from './block-to-liquid';
import { Options } from '../interfaces/options';
import { fastClone } from './fast-clone';
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
  return (
    liquid
      // Template interpolate tokens
      // HACK: get this into the appropriate place
      .replace(/context\.shopify\.liquid\.get\(\s*"(.*?)"\s*state\)/g, '$1')
      // TODO: can have double quotes in value
      .replace(
        /{{\s*context\.shopify\.liquid\.render\(("|&quot;)(.*?)("|&quot;),\s*state\)\s*}}/g,
        '$2'
      )
  );
};

const liquidExpression = (expression: string, options: Options = {}) => {
  return unescapeHtml(expression);
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
      plugins: [parserHtml, parserCss].concat((options?.plugins || []) as any[]), // TODO: how replace too
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

  const hasTests = Object.keys(content.variations || {}).length;

  const variationsJson =
    hasTests &&
    Object.keys(content.variations || {}).map(item => ({
      id: item,
      testRatio: content.variations![item]!.testRatio,
    }));

  // TODO: optimize CSS to remove redundancy
  let { html, css } = regexParse(
    `
  <div class="builder-component" data-name="${modelName}">
    <div
      class="builder-content"
      data-builder-content-id="${content.id}"
      data-builder-component="${modelName}"
      data-builder-variation-id="${content.id}"
    >
      <div 
        builder-content-id="${content.id}"
        builder-model="${modelName}">
        ${
          blocks
            ? blocks.map((block: BuilderElement) => blockToLiquid(block, options)).join('\n')
            : ''
        }
      </div>
    </div>

    ${Object.keys(content.variations || {})
      .map(key => {
        const value = content.variations![key]!;
        const blocks = value.data!.blocks;

        return `<div
        class="builder-content"
        data-builder-content-id="${content.id}"
        data-builder-variaion-id="${key}"
        data-builder-component="${modelName}"
      >
        <div 
          builder-content-id="${content.id}"
          builder-model="${modelName}">
          ${
            blocks
              ? blocks.map((block: BuilderElement) => blockToLiquid(block, options)).join('\n')
              : ''
          }
        </div>
      </div>`;
      })
      .join('\n')}
    </div>
    ${
      !hasTests
        ? ''
        : `
      <script>
      (function() {
        var variations = ${JSON.stringify(variationsJson)};
        function getCookie(cname) {
          var name = cname + "=";
          var decodedCookie = decodeURIComponent(document.cookie);
          var ca = decodedCookie.split(';');
          for(var i = 0; i <ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
              c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
              return c.substring(name.length, c.length);
            }
          }
          return "";
        }
        function setCookie(cname, cvalue, exdays) {
          if (!exdays) { exdays = 30; }
          var d = new Date();
          d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
          var expires = "expires="+d.toUTCString();
          document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/;SameSite=None;Secure";
        }
        var cookieName = 'builder.tests.${content.id}';
        var variationId = getCookie(cookieName);
        if (!variationId) {
          var n = 0;
          var set = false;
          var random = Math.random();
          for (var i = 0; i < variations.length; i++) {
            var variation = variations[i];
            var testRatio = variation.testRatio;
            n += testRatio;
            if (random < n) {
              setCookie(cookieName, variation.id);
              variationId = variation.id;
            }
          }
          if (!variationId) {
            variationId = "${content.id}";
            setCookie(cookieName, "${content.id}");
          }
        }
        if (variationId) {
          Array
            .from(document.querySelectorAll('[data-builder-content-id="${
              content.id
            }"]:not([data-builder-variation-id="' + variationId + '"]'))
            .forEach(function (el) {
              el.remove();
            });
        }
      })()
    </script>
    `
    }
    `.replace(/\s+/g, ' ')
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
