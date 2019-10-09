import { Liquid, ITemplate, ParseStream, TagToken, Token, Context, Hash, Emitter } from 'liquidjs';
import { BuilderElement } from '@builder.io/sdk';
import * as compiler from 'vue-template-compiler';
import { omit, compact } from 'lodash';

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
  ...options,
});

const tagRe = /\[([^\]]+)\]='([^']+)'/i;
interface ParsedTag {
  name: string;
  value: string;
}
const parseTag = (tag: string): ParsedTag | null => {
  const matched = tag.match(tagRe);
  if (matched) {
    console.log('matched', matched);
  }
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
    // TODO: classname, etc
    const properties: StringMap = {};
    const bindings: StringMap = {};

    for (const key in node.attrsMap) {
      const value = node.attrsMap[key];
      if (hasTag(value)) {
        const parsed = parseTag(value);
        if (parsed && parsed.name === 'output') {
          bindings[key] = JSON.parse(parsed.value).initial.replace(/'/g, '');
        }
      } else if (key !== 'class') {
        properties[key] = value;
      }
    }

    return el({
      tagName: node.tag,
      responsiveStyles: {
        large: {},
      },
      class: node.attrsMap.class, // TODO: handle class bindings
      properties: omit(properties, 'class'),
      bindings,
      children: await htmlAstToBuilder(
        node.children.filter(node => isTextNode(node) || isElement(node))
      ),
    });
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
        ...(parsedOutput && {
          ['component.options.text']: parsedOutput.initial.replace(/'/g, ''), // TODO: process filters like | t,
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

export const liquidToAst = (str: string) => {
  const engine = new Liquid();
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

    render: async function(ctx: Context, hash: Hash, emitter: Emitter) {
      // TODO: add <form> wrapper...
      await this.liquid.renderer.renderTemplates(this.templates, ctx, emitter);
    },

    renderSync: function(ctx: Context, hash: Hash, emitter: Emitter) {
      this.liquid.renderer.renderTemplatesSync(this.templates, ctx, emitter);
    },
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
  auth?: {
    token?: string;
    publicKey?: string;
  };
}

export const liquidToBuilder = async (str: string, options?: LiquidToBuilderOptions) => {
  const parsedTemplateItems = liquidToAst(str);
  const html = parsedLiquidToHtml(parsedTemplateItems);
  const htmlNodes = htmlToAst(html);
  const blocks = await htmlAstToBuilder(htmlNodes, options);
  return blocks;
};
