import { Liquid, ITemplate } from 'liquidjs';
import { BuilderElement } from '@builder.io/sdk';
import compiler from 'vue-template-compiler';

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

const htmlEncode = (html: string) => html.replace(/'/g, '&apos;').replace(/"/g, '&quot;');
const htmlDecode = (html: string) => html.replace(/&apos;/g, "'").replace(/&quot;/g, '"');

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

export const htmlNodeToBuilder = (node: compiler.ASTNode): BuilderElement => {
  if (isElement(node)) {
    // TODO: classname, etc
    return el({
      tagName: node.tag,
      // TODO: parse for [data] for bindings
      properties: node.attrsMap,
      children: node.children
        .filter(node => isTextNode(node) || isElement(node))
        .map(child => htmlNodeToBuilder(child)),
    });
  }

  // TODO: parse for [data] for bindings
  if (isTextNode(node)) {
    // TODO: classname, etc
    return el({
      tagName: 'span',
      responsiveStyles: {
        large: {
          display: 'inline',
        },
      },
      component: {
        name: 'Text',
        options: {
          text: node.text,
        },
      },
    });
  }

  // TODO: handle comment, etc
  return null as any;

  // TODO: add back
  // throw new Error('Unhandled node type');
};

export const liquidToAst = (str: string) => {
  const engine = new Liquid();
  const parsedTemplateItems = engine.parse(str);
  return parsedTemplateItems;
};

export const htmlToAst = (html: string) => {
  return compiler.compile(`<template>${html}</template>`).ast!.children;
};

export const htmlAstToBuilder = (nodes: compiler.ASTNode[]): BuilderElement[] => {
  // TODO: need to pass through index and array so can see if before/after is for, etc
  return nodes.map(node => htmlNodeToBuilder(node));
};

export const liquidToBuilder = async (str: string) => {
  const parsedTemplateItems = liquidToAst(str);
  const html = parsedLiquidToHtml(parsedTemplateItems);
  const htmlNodes = htmlToAst(html);
  const blocks = htmlAstToBuilder(htmlNodes);
  return blocks;
};
