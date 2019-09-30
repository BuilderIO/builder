import { Liquid, ITemplate, TagToken, Token } from 'liquidjs';
import { BuilderElement } from '@builder.io/sdk';
import { preprocess, AST } from '@glimmer/syntax';

interface IfTemplate extends ITemplate {
  impl: {
    branches: {
      cond: string;
      templates: ITemplate[];
    }[];
    elseTemplates: ITemplate[];
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

const isIfTemplate = (template: ITemplate): template is IfTemplate => template.token.type === 'if';
const isForTemplate = (template: ITemplate): template is ForTemplate =>
  template.token.type === 'for';
const isHtmlTemplate = (template: ITemplate): template is HtmlTemplate =>
  template.token.type === 'html';

export const parsedLiquidToHbs = (template: ITemplate[]) => {
  let hbs = '';

  for (const item of template) {
    processTemplate(item);
  }

  function processTemplate(template: ITemplate) {
    if (isHtmlTemplate(template)) {
      hbs += template.str;
    } else if (isIfTemplate(template)) {
      template.impl.branches.forEach((item, index) => {
        if (index === 0) {
          // TODO: need another string replace, maybe tilda and put back
          hbs += `{{#if '${item.cond.replace(/'/, '`')}' }}`;
        } else {
          hbs += `{{ else if '' }}`;

          item.templates.forEach(tpl => processTemplate(tpl));
        }
      });
      if (template.impl.elseTemplates) {
        hbs += '{{ else }}';
        template.impl.elseTemplates.forEach(tpl => processTemplate(tpl));
      }
      hbs += '{{/if}}';
    } else if (isForTemplate(template)) {
      hbs += `{{#for '${JSON.stringify({
        ...template.impl,
        templates: undefined,
        elseTemplates: undefined,
      })}' }}`;
      template.impl.templates.forEach(tpl => processTemplate(tpl));
      if (template.impl.elseTemplates) {
        hbs += '{{ else }}';
        template.impl.elseTemplates.forEach(tpl => processTemplate(tpl));
      }
      hbs += '{{/for}}';
    }
  }

  return hbs;
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

const hbsNodeToBuilder = (node: AST.Node): BuilderElement => {
  if (node.type === 'ElementNode') {
    // TODO: classname, etc
    return el({
      tagName: node.tag,
      bindings: node.attributes.reduce(
        (memo, attr) => {
          // TODO: process these
          return memo;
        },
        {} as { [key: string]: string }
      ),
      properties: node.attributes.reduce(
        (memo, attr) => {
          if (attr.value.type === 'TextNode' && attr.name !== 'class') {
            memo[attr.name] = attr.value.chars;
          }
          return memo;
        },
        {} as { [key: string]: string }
      ),
      children: node.children.map(child => hbsNodeToBuilder(child)),
    });
  }

  throw new Error('Unhandled node type');
};
export const handlebarsToBuilder = (program: AST.Template) => {
  const blocks = program.body.map(node => hbsNodeToBuilder(node));
  return blocks;
};

export const liquidToAst = (str: string) => {
  const engine = new Liquid();
  const parsedTemplateItems = engine.parse(str);
  return parsedTemplateItems;
}

export const liquidToBuilder = async (str: string) => {
  const parsedTemplateItems = liquidToAst(str)
  const hbs = parsedLiquidToHbs(parsedTemplateItems);
  const hbsProgram = preprocess(hbs);
  const blocks = handlebarsToBuilder(hbsProgram);
  return blocks;
};
