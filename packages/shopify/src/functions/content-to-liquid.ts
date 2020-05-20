import { BuilderElement, BuilderContent } from '@builder.io/sdk';
import { format } from 'prettier/standalone';
import * as parserCss from 'prettier/parser-postcss';
import * as parserHtml from 'prettier/parser-html';
import type { Options as PrettierOptions } from 'prettier';
import { blockToLiquid } from './block-to-liquid';
import { Options } from '../interfaces/options';
import { fastClone } from './fast-clone';
import * as CleanCSS from 'clean-css';
import * as csso from 'csso';
import * as dedent from 'dedent';

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
  font-family: "${family}";
  src: local("${family}"), url('${url}') format('woff2');
  font-display: fallback;
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
  font-family: "${family}";
  src: local("${family}"), url('${weightUrl}') format('woff2');
  font-display: fallback;
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
  // todo: Validate data.cssCode
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

  const wrap = options?.wrap !== false;
  const useBuilderSignature = options?.useBuilderSignature !== false;

  const innerContent = blocks
    ? blocks.map((block: BuilderElement) => blockToLiquid(block, options)).join('\n')
    : '';

  // TODO: optimize CSS to remove redundancy
  let { html, css } = regexParse(
    !wrap
      ? innerContent
      : `
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
        ${innerContent}
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

  css = css + getCss(json.data);

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
    html +
    (!wrap || !useBuilderSignature
      ? ''
      : `\n\n<!-- /**** Generated by Builder.io on ${dateString} *****/ -->\n`);

  // Convert to handlebars and back because it is similar to liquid and has a prettier
  // formatter for it
  html = prettify(html, {
    ...options.prettierOptions,
    parser: 'html',
  });

  if (wrap && useBuilderSignature) {
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
  }

  return {
    html,
    css: css || undefined,
  };
}
