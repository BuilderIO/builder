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

const isIfTemplate = (template: ITemplate): template is IfTemplate =>
  template.token.type === 'tag' && (template.token as any).name === 'if';
const isForTemplate = (template: ITemplate): template is ForTemplate =>
  template.token.type === 'tag' && (template.token as any).name === 'for';
const isHtmlTemplate = (template: ITemplate): template is HtmlTemplate =>
  template.token.type === 'html';
const isOutputTemplate = (template: ITemplate): template is OutputTemplate =>
  template.token.type === 'output';

const isElement = (node: compiler.ASTNode): node is compiler.ASTElement => node.type === 1;
const isTextNode = (node: compiler.ASTNode): node is compiler.ASTText => node.type === 3;

const htmlEncode = (html: string) => html.replace(/'/g, '_APOS_').replace(/"/g, '_QUOT_');
const htmlDecode = (html: string) => html.replace(/_APOS_/g, "'").replace(/_QUOT_/g, '"');

export const parsedLiquidToHtml = (template: ITemplate[]) => {
  let html = '';

  for (const item of template) {
    processTemplate(item);
  }

  function processTemplate(template: ITemplate) {
    if (isHtmlTemplate(template)) {
      html += template.str;
    } else if (isIfTemplate(template)) {
      template.impl.branches.forEach((item, index) => {
        // TODO: unless
        if (index === 0) {
          // TODO: need another string replace, maybe tilda and put back
          html += `[if]='${htmlEncode(item.cond)}'`;
        } else {
          html += `[else-if]='${htmlEncode(item.cond)}'`;

          item.templates.forEach(tpl => processTemplate(tpl));
        }
      });
      if (template.impl.elseTemplates) {
        html += '[else]';
        template.impl.elseTemplates.forEach(tpl => processTemplate(tpl));
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
      template.impl.templates.forEach(tpl => processTemplate(tpl));
      if (template.impl.elseTemplates) {
        html += '[else]';
        template.impl.elseTemplates.forEach(tpl => processTemplate(tpl));
      }
      html += '[end-for]';
    } else if (isOutputTemplate(template)) {
      html += `[output]='${htmlEncode(JSON.stringify(template.value))}'`;
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
    importedFrom: 'liquid'
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
  options?: LiquidToBuilderOptions
): Promise<BuilderElement | null> => {
  // TODO: if and for and form and section and assign
  if (isElement(node)) {
    if (node.tag === 'builder-component') {
      return el({
        responsiveStyles: {
          large: {
            boxSizing: 'border-box'
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
          boxSizing: 'border-box'
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
          const translation = await getTranslation(parsedValue, options);
          const { initial } = parsedValue;
          if (translation != null) {
            properties[key] = translation;
          } else {
            bindings[key] = initial.replace(/'/g, '');
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
    let parsed: ParsedTag | null = null;
    if (hasTag(text)) {
      parsed = parseTag(text)!;
      text = '';
    }

    const parsedOutput = parsed && parsed.name === 'output' && JSON.parse(parsed.value);
    const parsedValue = parsedOutput;
    const translation = await getTranslation(parsedValue, options);
    if (translation != null) {
      text = translation;
    }

    if (parsed && ['if', 'for', 'unless'].includes(parsed.name)) {
      queuedBinding = parsed;
      return null;
    }

    let thisQueuedBinding: ParsedTag | null = null;

    // TODO: handle multiple elements in the if
    if (queuedBinding) {
      thisQueuedBinding = queuedBinding;
      queuedBinding = null;
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
            ['component.options.text']: `${parsedOutput.initial.replace(/'/g, '')} || ''`, // TODO: process filters like | t,
          }),
        ...(thisQueuedBinding &&
          thisQueuedBinding.name === 'if' && {
            show: thisQueuedBinding.value,
          }),
        ...(thisQueuedBinding &&
          thisQueuedBinding.name === 'unless' && {
            show: thisQueuedBinding.value,
          }),
      } as { [key: string]: string },
      ...(thisQueuedBinding &&
        thisQueuedBinding.name === 'for' &&
        parsedOutput && {
          repeat: {
            itemName: parsedOutput.variable,
            collection: parsedOutput.collection,
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
  const quoted = /^'[^']*'|"[^"]*"$/;

  engine.registerTag('section', {
    parse: function(token) {
      // this.namestr = token.args;
    },
    render: () => null,
  });
  engine.registerTag('form', {
    parse: function(tagToken: TagToken, remainTokens: Token[]) {
      this.templates = [];

      const stream: ParseStream = this.liquid.parser
        .parseStream(remainTokens)
        .on('tag:endform', () => stream.stop())
        .on('template', (tpl: ITemplate) => this.templates.push(tpl))
        .on('end', () => {
          throw new Error(`tag ${tagToken.raw} not closed`);
        });

      stream.start();
    },
    render: () => null,
  });

  const parsedTemplateItems = engine.parse(str);
  return parsedTemplateItems;
};

export const htmlToAst = (html: string) => {
  return compiler.compile(`<template>${html}</template>`).ast!.children;
};

export const htmlAstToBuilder = async (
  nodes: compiler.ASTNode[],
  options?: LiquidToBuilderOptions
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
  const html = parsedLiquidToHtml(parsedTemplateItems);
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
