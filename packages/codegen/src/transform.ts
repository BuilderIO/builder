import * as ts from 'typescript';
import { BuilderElement } from '@builder.io/sdk';
import * as json5 from 'json5';

type Json = string | boolean | null | JsonObject | JsonArray;

type JsonArray = Json[];

type JsonObject = { [key: string]: Json | undefined };

const isNode = (thing: unknown): thing is ts.Node => {
  return thing && typeof (thing as ts.Node).getLeadingTriviaWidth === 'function';
};

const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

// HACK
let sharedFile: ts.SourceFile | null = null;

const jsonToAst = (json: Json | undefined | ts.Node): ts.Node => {
  if (isNode(json)) {
    return json;
  }
  switch (typeof json) {
    case 'undefined':
      return ts.createIdentifier('undefined');
    case 'string':
    case 'number':
    case 'boolean':
      return ts.createLiteral(json);
    case 'object':
      if (!json) {
        return ts.createNull();
      }
      if (Array.isArray(json)) {
        return arrayToAst(json);
      }
      return jsonObjectToAst(json);
  }
};

const arrayToAst = (array: JsonArray) => {
  return ts.createArrayLiteral(array.map(item => jsonToAst(item)) as ts.Expression[]);
};

const jsonObjectToAst = (json: JsonObject): ts.ObjectLiteralExpression => {
  const properties: ts.PropertyAssignment[] = [];
  for (const key in json) {
    const value = json[key];
    if (value === undefined) {
      continue;
    }
    const keyCanBeIdentifier = /^[a-z][a-z0-9]?^/i.test(key);
    const keyAst = keyCanBeIdentifier ? ts.createIdentifier(key) : ts.createStringLiteral(key);
    const valueAst = jsonToAst(value);
    properties.push(ts.createPropertyAssignment(keyAst, valueAst as any));
  }
  const newNode = ts.createObjectLiteral(properties);

  return newNode;
};

const isUppercaseChar = (char: string) => Boolean(char && char.toUpperCase() === char);
const lowerCaseFirstChar = (str: string) => str && str[0].toLowerCase() + str.slice(1);

const jsxElementToObject = (node: ts.JsxElement): BuilderElement => {
  const { openingElement } = node;

  const obj: BuilderElement & { code: any } = {
    '@type': '@builder.io/sdk:Element',
    tagName: openingElement.tagName.getText(),
    // TODO: bindings and actions
    properties: {},
    responsiveStyles: {},
    code: {
      actions: {},
      bindings: {},
    },
  };

  for (const attribute of openingElement.attributes.properties) {
    const name = attribute.name!.getText();
    if (ts.isJsxAttribute(attribute)) {
      switch (name) {
        case 'css': {
          obj.responsiveStyles!.large = (attribute.initializer as any).expression;
          break;
        }
        case 'uid': {
          obj.id = 'builder-' + (attribute.initializer as any).text;
          break;
        }
        default: {
          if (name.startsWith('on')) {
            const actionName = lowerCaseFirstChar(name.slice(2));
            obj.code.actions[actionName] = printer
              .printNode(
                ts.EmitHint.Unspecified,
                (attribute.initializer as any).expression.body,
                sharedFile!
              )
              .replace(/^{|}$/g, '');
          } else {
            obj.properties![name] = (attribute.initializer as any).expression;
          }
        }
      }
    }

    let childIsComponent = false;
    const children = node.children.filter(item => ts.isJsxElement(item));
    if (children.length === 1) {
      const child = children[0];

      const componentName = ts.isJsxElement(child) && child.openingElement.tagName.getText();
      childIsComponent = Boolean(
        ts.isJsxElement(child) && componentName && isUppercaseChar(componentName[0])
      );

      if (childIsComponent) {
        obj.component = {
          name: componentName as string,
          options: {},
        };
        if (ts.isJsxElement(child)) {
          for (const attribute of child.openingElement.attributes.properties) {
            if (ts.isJsxAttribute(attribute)) {
              const name = attribute.name!.getText();
              obj.component.options[name] = (attribute.initializer as any).expression;
            }
          }
        }
      }
    }
    if (!childIsComponent) {
      obj.children = children.map(child => jsxElementToObject(child as ts.JsxElement));
    }

    // Map props by schema
  }

  return obj;
};

export function transform(context: ts.TransformationContext) {
  const previousOnSubstituteNode = context.onSubstituteNode;

  context.enableSubstitution(ts.SyntaxKind.JsxElement);
  context.enableSubstitution(ts.SyntaxKind.JsxFragment);

  context.onSubstituteNode = (hint, node) => {
    node = previousOnSubstituteNode(hint, node);

    if (ts.isJsxElement(node)) {
      node = jsonObjectToAst((jsxElementToObject(node as ts.JsxElement) as unknown) as JsonObject);
    } else if (ts.isJsxFragment(node)) {
      node = ts.createArrayLiteral(
        node.children
          .filter(item => ts.isJsxElement(item))
          .map(item =>
            jsonObjectToAst((jsxElementToObject(item as ts.JsxElement) as unknown) as JsonObject)
          )
      );
    }

    return node;
  };

  return (file: ts.SourceFile) => {
    sharedFile = file;

    return file;
  };
}

export function tsxToBuilder(tsString: string) {
  const str = ts
    .transpileModule(tsString, {
      compilerOptions: {
        jsx: ts.JsxEmit.Preserve,
      },
      transformers: {
        before: [transform],
      },
    })
    .outputText.trim()
    .replace(/;$/, '');

  // Yoink the JSON
  const jsonStr = str.match(/\[[\s\S]+\]/)?.[0] || '';

  // Use Json 5 to allow any form of JSON object in JS to be parsed,
  // e.g. keys as identifier ({ foo: 'bar' }) instead of double quoted strings
  // { "foo": "bar" }
  return json5.parse(jsonStr);
}
