import * as ts from 'typescript';
import { BuilderElement } from '@builder.io/sdk';

type Json = string | boolean | null | JsonObject | JsonArray;

type JsonArray = Json[];

type JsonObject = { [key: string]: Json | undefined };

const jsonToAst = (json: Json | undefined): ts.Expression => {
  switch (typeof json) {
    case 'undefined':
      return ts.createIdentifier('undefined');
    case 'string':
    case 'number':
    case 'boolean':
      return ts.createLiteral(json);
    case 'object':
      if (!json) {
        return ts.createLiteral(json as null);
      }
      if (Array.isArray(json)) {
        return arrayToAst(json);
      }
      return jsonObjectToAst(json);
  }
};

const arrayToAst = (array: JsonArray) => {
  return ts.createArrayLiteral(array.map(item => jsonToAst(item)));
};

const jsonObjectToAst = (json: JsonObject): ts.ObjectLiteralExpression => {
  const properties: ts.PropertyAssignment[] = [];
  for (const key in json) {
    const value = json[key];
    const keyCanBeIdentifier = /^[a-z][a-z0-9]?^/i.test(key);
    const keyAst = keyCanBeIdentifier ? ts.createIdentifier(key) : ts.createStringLiteral(key);
    const valueAst = jsonToAst(value);
    properties.push(ts.createPropertyAssignment(keyAst, valueAst));
  }
  const newNode = ts.createObjectLiteral(properties);

  return newNode;
};

const jsxElementToObject = (node: ts.JsxElement): ts.ObjectLiteralExpression => {
  const { openingElement } = node;

  const obj: BuilderElement = {
    '@type': '@builder.io/sdk:Element',
    tagName: openingElement.tagName.getText()
  };

  for (const attribute of openingElement.attributes.properties) {
    if (attribute.name.getText() === 'css') {
      // Map styles to JS
    }

    // Map props by schema
  }

  return jsonObjectToAst((obj as unknown) as JsonObject);
};

function transform(context: ts.TransformationContext) {
  const previousOnSubstituteNode = context.onSubstituteNode;

  context.enableSubstitution(ts.SyntaxKind.JsxElement);

  context.onSubstituteNode = (hint, node) => {
    node = previousOnSubstituteNode(hint, node);

    if (ts.isJsxElement(node)) {
      node = jsxElementToObject(node as ts.JsxElement);
    }

    return node;
  };

  return (file: ts.SourceFile) => file;
}

export function convertTsToLiquid(tsString: string) {
  return ts
    .transpileModule(tsString, {
      transformers: {
        after: [transform],
      },
    })
    .outputText.trim()
    .replace(/;$/, '');
}
