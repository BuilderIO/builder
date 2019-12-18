import { BuilderElement } from '@builder.io/sdk';
import { ITemplate, Liquid, ParseStream, TagToken, Token } from 'liquidjs';
import { compact, omit, get } from 'lodash';
import * as compiler from 'vue-template-compiler';
import axiosRaw from 'axios';
import { isError, attempt } from 'lodash';
const { setupCache } = require('axios-cache-adapter/dist/cache.node.js');
const axiosCache = setupCache({
  exclude: { query: false },
});

// Webpack workaround to conditionally require certain external modules
// only on the server and not bundle them on the client
let serverOnlyRequire: NodeRequire;
try {
  // tslint:disable-next-line:no-eval
  serverOnlyRequire = eval('require');
} catch (err) {
  // all good
  serverOnlyRequire = (() => null) as any;
}

const http = serverOnlyRequire('http');
const https = serverOnlyRequire('https');
const httpAgent = (http && new http.Agent({ keepAlive: true })) || undefined;
const httpsAgent = (https && new https.Agent({ keepAlive: true })) || undefined;

// Create `axios` instance passing the newly created `cache.adapter`
const axios = axiosRaw.create({
  timeout: 30000,
  adapter: axiosCache.adapter,
  httpAgent,
  httpsAgent,
});

interface IfTemplate extends ITemplate {
  impl: {
    branches: {
      cond: string;
      templates: ITemplate[];
    }[];
    elseTemplates: ITemplate[];
  };
}

interface OutputTemplate extends ITemplate {
  value: {
    filters: any[]; // TODO
    initial: string;
  };
}

interface ForTemplate extends ITemplate {
  impl: {
    templates: ITemplate[];
    elseTemplates: ITemplate[];
  };
}

interface HtmlTemplate extends ITemplate {
  str: string;
}

interface BlockTemplate extends ITemplate {
  impl: {
    name: string;
    templates: ITemplate[];
    args: string;
  };
}

const liquidBindingTemplate = (str: string) =>
  `state.shopify.liquid.get("${str.replace(/"/g, '\\"')}")`;

const isIfTemplate = (template: ITemplate): template is IfTemplate =>
  template.token.type === 'tag' && (template.token as any).name === 'if';
const isForTemplate = (template: ITemplate): template is ForTemplate =>
  template.token.type === 'tag' && (template.token as any).name === 'for';
const isBlockTemplate = (template: ITemplate): template is ForTemplate =>
  template.token.type === 'tag' && (template.token as any).name === 'for';
const isHtmlTemplate = (template: ITemplate): template is HtmlTemplate =>
  template.token.type === 'html';
const isOutputTemplate = (template: ITemplate): template is OutputTemplate =>
  template.token.type === 'output';

const isElement = (node: compiler.ASTNode): node is compiler.ASTElement => node.type === 1;
const isTextNode = (node: compiler.ASTNode): node is compiler.ASTText => node.type === 3;

const htmlEncode = (html: string) => html.replace(/'/g, '_APOS_').replace(/"/g, '_QUOT_');
const htmlDecode = (html: string) => html.replace(/_APOS_/g, "'").replace(/_QUOT_/g, '"');

export const parsedLiquidToHtml = async (
  templates: ITemplate[],
  options: LiquidToBuilderOptions
) => {
  let html = '';

  for (const item of templates) {
    await processTemplate(item);
  }

  async function processTemplate(template: ITemplate) {
    if (isHtmlTemplate(template)) {
      html += template.str;
    } else if (isIfTemplate(template)) {
      console.log('hi');
      await Promise.all(
        template.impl.branches.map(async (item, index) => {
          console.log('eh');
          // TODO: unless
          if (index === 0) {
            // TODO: need another string replace, maybe tilda and put back
            html += `[if]='${htmlEncode(item.cond)}'`;
          } else {
            html += `[else-if]='${htmlEncode(item.cond)}'`;
          }
          await Promise.all(item.templates.map(tpl => processTemplate(tpl)));
        })
      );
      if (template.impl.elseTemplates && template.impl.elseTemplates.length) {
        html += '[else]';
        await Promise.all(template.impl.elseTemplates.map(tpl => processTemplate(tpl)));
      }
      html += '[end-if]';
    } else if (isForTemplate(template)) {
      html += `[for]='${htmlEncode(
        JSON.stringify({
          ...template.impl,
          templates: undefined,
          elseTemplates: undefined,
          liquid: undefined,
        })
      )}'`;
      await Promise.all(template.impl.templates.map(tpl => processTemplate(tpl)));
      if (template.impl.elseTemplates) {
        html += '[else]';
        await Promise.all(template.impl.elseTemplates.map(tpl => processTemplate(tpl)));
      }
      html += '[end-for]';
    } else if (isOutputTemplate(template)) {
      html += `[output]='${htmlEncode(
        JSON.stringify({ ...template.value, raw: template.token.value })
      )}'`;
    } else {
      // TODO: preprocess liquid to expand forms, sections, etc OR do at html phase

      const name = (template as any).name || '';
      const args = (template as any).token.args || '';

      if (name === 'assign') {
        const block = {
          component: {
            name: 'Shopify:Assign',
            options: {
              expression: args,
            },
          },
        };
        html += `<builder-serialized-block block='${htmlEncode(
          JSON.stringify(block)
        )}'></builder-serialized-block>`;
      } else if (name === 'schema') {
        // TODO: generic liquid component to add back liquid content
        // TODO: serialize this to component can read from dom to { component: 'shopify:schema', optoins: { json: ... }}
      } else if (name === 'javascript') {
        // TODO: custom code block or special Shopify component
      } else if (name === 'stylesheet') {
        // TODO: custom code block or special Shopify component
      } else if (name === 'section') {
        // Handle me...
        const matched = args.match(/['"]([^'"]+)['"]/);
        const path = matched && matched[1];

        const { auth, themeId } = options;
        if (auth && path && themeId) {
          const { publicKey, token } = auth;
          if (publicKey && token) {
            const shopifyRoot = 'https://builder.io/api/v1/shopify/api/2019-04';
            const headers = {
              Authorization: `Bearer ${token}`,
            };

            const currentAsset = await fetch(
              `${shopifyRoot}/themes/${themeId}/assets.json?asset[key]=sections/${path}.liquid&apiKey=${publicKey}`,
              { headers }
            )
              .then(res => res.json())
              .then(res => res.asset)
              .catch(err => {
                console.warn('Could not get section', err, template);
                return null;
              });

            if (currentAsset && currentAsset.value) {
              html += await parsedLiquidToHtml(
                await liquidToAst(currentAsset.value, options),
                options
              );
            }
          }
        }
      } else if (name === 'include') {
        // Handle me...
        const matched = args.match(/['"]([^'"]+)['"]/);
        const path = matched && matched[1];

        const { auth, themeId } = options;
        if (auth && path && themeId) {
          const { publicKey, token } = auth;
          if (publicKey && token) {
            const shopifyRoot = 'https://builder.io/api/v1/shopify/api/2019-04';
            const headers = {
              Authorization: `Bearer ${token}`,
            };

            const currentAsset = await fetch(
              `${shopifyRoot}/themes/${themeId}/assets.json?asset[key]=snippets/${path}.liquid&apiKey=${publicKey}`,
              { headers }
            )
              .then(res => res.json())
              .then(res => res.asset)
              .catch(err => {
                console.warn('Could not get section', err, template);
                return null;
              });

            if (currentAsset && currentAsset.value) {
              html += await parsedLiquidToHtml(
                await liquidToAst(currentAsset.value, options),
                options
              );
            }
          }
        }
      } else {
        // It's a block
        html += `<liquid name="${name}" args="${args}">${await parsedLiquidToHtml(
          (template as any).impl.templates || [],
          options
        )}</liquid>`;
      }
    }
  }

  return html;
};

const el = (options?: Partial<BuilderElement>): BuilderElement => ({
  '@type': '@builder.io/sdk:Element',
  id:
    'builder-' +
    Math.random()
      .toString()
      .split('.')[1],
  meta: {
    importedFrom: 'liquid',
  },
  // TODO: merge(...)
  ...options,
});

const tagRe = /\[([^\]]+)\]='([^']+)'/i;
interface ParsedTag {
  name: string;
  value: string;
}
const parseTag = (tag: string): ParsedTag | null => {
  const matched = tag.match(tagRe);
  return (
    matched && {
      name: htmlDecode(matched[1]),
      value: htmlDecode(matched[2]),
    }
  );
};

interface StringMap {
  [key: string]: string;
}

const hasTag = (html: string) => !!parseTag(html);

let queuedBinding: null | ParsedTag = null;

export const htmlNodeToBuilder = async (
  node: compiler.ASTNode,
  index: number,
  parentArray: compiler.ASTNode[],
  options: LiquidToBuilderOptions
): Promise<BuilderElement | null> => {
  // TODO: if and for and form and section and assign
  if (isElement(node)) {
    if (node.tag === 'builder-serialized-block') {
      try {
        return el(JSON.parse(htmlDecode(node.attrsMap.block.replace(/"/g, '\\"'))));
      } catch (err) {
        console.error('Builder serialized block error', err, '\n\nin:', node.attrsMap.block);
        return el({
          component: {
            name: 'Text',
            options: {
              text: `Builder serialized block error: ${String(err)}`,
            },
          },
        });
      }
    }

    if (node.tag === 'builder-component') {
      return el({
        responsiveStyles: {
          large: {
            boxSizing: 'border-box',
          },
        },
        children: await htmlAstToBuilder(
          node.children.filter(node => isTextNode(node) || isElement(node)),
          options
        ),
      });
    }
    const element = el({
      tagName: node.tag,
      responsiveStyles: {
        large: {
          boxSizing: 'border-box',
        },
      },
      class: node.attrsMap.class, // TODO: handle class bindings
      properties: {},
      bindings: {},
      children: await htmlAstToBuilder(
        node.children.filter(node => isTextNode(node) || isElement(node)),
        options
      ),
    });
    const properties = element.properties!;
    const bindings = element.bindings!;

    for (const key in node.attrsMap) {
      const value = node.attrsMap[key];
      if (hasTag(value)) {
        const parsed = parseTag(value);
        if (parsed && parsed.name === 'output') {
          const parsedValue = JSON.parse(parsed.value);
          // TODO: proper parsing
          const translation = await getTranslation(parsedValue, options);
          const { initial } = parsedValue;
          if (translation != null) {
            properties[key] = translation;
          } else {
            bindings[key] = liquidBindingTemplate(initial);
          }
        } else {
          console.log('no match', parsed);
        }
      } else if (key !== 'class') {
        if (key.includes('[')) {
          // debugger
          console.warn(key);
        } else {
          properties[key] = value;
        }
      }
    }

    return element;
  }

  // TODO: parse for [data] for bindings
  if (isTextNode(node)) {
    let text = node.text;
    if (!text.trim()) {
      return null;
    }
    let parsed: ParsedTag | null = null;
    if (hasTag(text)) {
      parsed = parseTag(text)!;
      text = '';
    }

    const parsedOutput = parsed && parsed.name === 'output' && JSON.parse(parsed.value);
    const parsedFor = parsed && parsed.name === 'for' && JSON.parse(parsed.value);
    const parsedValue = parsedOutput;
    const translation = await getTranslation(parsedValue, options);
    if (translation != null) {
      text = translation;
    }

    // TODO: classname, etc
    const block = el({
      tagName: 'span',
      responsiveStyles: {
        large: {
          display: 'inline',
        },
      },
      bindings: {
        ...(parsedOutput &&
          translation == null && {
            ['component.options.text']: liquidBindingTemplate(parsedOutput.raw),
          }),
        ...(parsed &&
          parsed.name === 'if' && {
            show: liquidBindingTemplate(parsed.value),
          }),
        ...(parsed &&
          parsed.name === 'unless' && {
            hide: liquidBindingTemplate(parsed.value),
          }),
      } as { [key: string]: string },
      ...(parsed &&
        parsed.name === 'for' &&
        !isError(parsedFor) && {
          repeat: {
            itemName: parsedFor.variable,
            collection: liquidBindingTemplate(parsedFor.collection),
          },
        }),
      component: {
        name: 'Text',
        options: { text },
      },
    });

    return block;
  }

  // TODO: handle comment, etc
  console.warn('node not matched', node);

  return null as any;

  // TODO: add back
  // throw new Error('Unhandled node type');
};

const getTranslation = async (parsedValue: any, options: LiquidToBuilderOptions = {}) => {
  if (!parsedValue) {
    return null;
  }
  const { filters, initial } = parsedValue;
  if (Array.isArray(filters)) {
    const translate = Boolean(filters.find(item => item.name === 't'));
    if (translate) {
      const publicKey = options && options.auth && options.auth.publicKey;
      const token = options && options.auth && options.auth.token;
      const themeId = options?.themeId;
      // TODO: later keep translation support trough some means
      if (publicKey && token && themeId) {
        const shopifyRoot = 'https://builder.io/api/v1/shopify/api/2019-04';
        const result = await axios.get(
          `${shopifyRoot}/themes/${themeId}/assets.json?asset[key]=locales/en.default.json&apiKey=${publicKey}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const json = result.data && result.data.asset && result.data.asset.value;
        const parsed = typeof json === 'string' && attempt(() => JSON.parse(json));
        if (!isError(parsed)) {
          const translationValue = get(parsed, initial.replace(/'/g, ''));
          return translationValue;
        }
      } else {
        console.warn('Could not grab translation', options);
      }
    }
  }
  return null;
};

export const liquidToAst = (str: string, options: LiquidToBuilderOptions = {}) => {
  const engine = new Liquid();

  // TODO: handle other tags
  const selfCloseTags = ['section', 'render', 'include', 'echo', 'liquid', 'layout'];

  selfCloseTags.forEach(tag => {
    engine.registerTag(tag, {
      parse: function(token, remainTokens) {
        this.remainTokens = remainTokens;
        this.templates = [];
        this.type = 'block';
        this.blockType = 'selfClose';
        this.name = tag;
        this.args = token.args;
      },
      render: () => null,
    });
  });

  const nonLiquidBlockTags = ['style', 'stylesheet', 'javascript', 'schema'];
  nonLiquidBlockTags.forEach(tag => {
    engine.registerTag(tag, {
      parse: function(token, remainTokens) {
        this.remainTokens = remainTokens;
        this.tokens = [];
        this.type = 'block';
        this.blockType = 'nonLiquidBlock';
        this.name = tag;
        this.args = token.args;

        this.tokens = [];
        const stream = this.liquid.parser.parseStream(remainTokens);
        stream
          .on('token', token => {
            if ((token as any).name === 'end' + tag) stream.stop();
            else this.tokens.push(token);
          })
          .on('end', () => {
            throw new Error(`tag ${token.raw} not closed`);
          });
        stream.start();
      },
      render: () => null,
    });
  });

  const blockTags = ['form', 'paginate', 'schema'];
  blockTags.forEach(tag => {
    engine.registerTag(tag, {
      parse: function(token, remainTokens) {
        this.remainTokens = remainTokens;
        this.templates = [];
        this.type = 'block';
        this.name = tag;
        this.args = token.args;

        const stream: ParseStream = this.liquid.parser
          .parseStream(remainTokens)
          .on('tag:end' + tag, () => stream.stop())
          .on('template', (tpl: ITemplate) => this.templates.push(tpl))
          .on('end', () => {
            throw new Error(`tag ${token.raw} not closed`);
          });

        stream.start();
      },
      render: () => null,
    });
  });

  const parsedTemplateItems = engine.parse(str);
  return parsedTemplateItems;
};

export const htmlToAst = (html: string) => {
  return compiler.compile(`<template>${html}</template>`).ast!.children;
};

export const htmlAstToBuilder = async (
  nodes: compiler.ASTNode[],
  options: LiquidToBuilderOptions
): Promise<BuilderElement[]> => {
  // TODO: need to pass through index and array so can see if before/after is for, etc
  return compact(
    await Promise.all(
      nodes.map((node, index, nodes) => htmlNodeToBuilder(node, index, nodes, options))
    )
  );
};

export interface LiquidToBuilderOptions {
  log?: boolean;
  themeId?: string;
  auth?: {
    token?: string;
    publicKey?: string;
  };
}

export const liquidToBuilder = async (liquid: string, options: LiquidToBuilderOptions = {}) => {
  if (options.log) {
    console.log('liquidToBuilder: liquid', { liquid });
  }
  const parsedTemplateItems = liquidToAst(liquid, options);
  if (options.log) {
    console.log('liquidToBuilder: parsed liquid', parsedTemplateItems);
  }
  const html = await parsedLiquidToHtml(parsedTemplateItems, options);
  if (options.log) {
    console.log('liquidToBuilder: html', { html });
  }
  const htmlNodes = htmlToAst(html);
  if (options.log) {
    console.log('liquidToBuilder: parsed html', htmlNodes);
  }
  // TODO: remove builder-component blocks
  const blocks = await htmlAstToBuilder(htmlNodes, options);
  if (options.log) {
    console.log('liquidToBuilder: blocks', blocks);
  }
  return blocks;
};
