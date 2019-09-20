import * as ts from 'typescript';

export const TEMPLATE_START_TOKEN = '%%TEMPLATE_START%%';
export const PART_START_TOKEN = '%%TEMPLATE_PART_START%%';
export const PART_END_TOKEN = '%%TEMPLATE_PART_END%%';
export const TEMPLATE_END_TOKEN = '%%TEMPLATE_END%%';

const code = (parts: TemplateStringsArray, ...nodes: ts.Expression[]) => {
  // TODO: potentially another way to do this is create these things as identifiers.
  // ts.createIdentifier('{ % foo }') hmm
  return ts.createTemplateExpression(
    ts.createTemplateHead(TEMPLATE_START_TOKEN + parts[0] + PART_START_TOKEN),
    parts
      .slice(1)
      .map((part, index) =>
        ts.createTemplateSpan(
          nodes[index],
          index === parts.length - 2
            ? ts.createTemplateTail(PART_END_TOKEN + part + TEMPLATE_END_TOKEN)
            : ts.createTemplateMiddle(PART_END_TOKEN + part + PART_START_TOKEN)
        )
      )
  );
};

const parents = (node: ts.Node, cb: (node: ts.Node) => boolean) => {
  let current = node;
  let iterations = 0;
  do {
    if (iterations++ > 100) {
      console.error('Too many parent interations')
      break;
    }
    const result = cb(current);
    if (result === true) {
      return current;
    }
  } while ((current = current.parent));
  return null;
};

const replace = (newNode: ts.Node, oldNode: ts.Node): ts.Node => ts.setTextRange(newNode, oldNode);

function transform(context: ts.TransformationContext) {
  const previousOnSubstituteNode = context.onSubstituteNode;

  context.enableSubstitution(ts.SyntaxKind.ConditionalExpression);
  context.enableSubstitution(ts.SyntaxKind.BinaryExpression);
  context.enableSubstitution(ts.SyntaxKind.Identifier);

  context.onSubstituteNode = (hint, node) => {
    node = previousOnSubstituteNode(hint, node);
    let currentNode = node;
    let updated = true;
    let updates = 0;

    while (updated) {
      updated = false;

      if (updates++ > 100) {
        console.error('Too many updates');
        break;
      }

      if (ts.isCallExpression(node)) {
        const normalizeExpressionText = (text: string) => text.replace(/\(\)\s/g, '')
        // Match it by name
        if (normalizeExpressionText(node.expression.getText()) === 'price') {
          // Replace with price access expression
          // TODO: namespace shopify.getProductPrice() etc
        }
      }

      // Convert `undefined` to `''`
      if (ts.isIdentifier(node) && node.text === 'undefined') {
        node = ts.setTextRange(ts.createStringLiteral(''), node);
      }

      if (ts.isIdentifier(node) && node.text === '$index') {
        node = ts.setTextRange(ts.createIdentifier('forloop.index'), node);
      }

      // Convert === to == for proper ruby
      if (
        ts.isBinaryExpression(node) &&
        node.operatorToken.kind === ts.SyntaxKind.EqualsEqualsEqualsToken
      ) {
        node = ts.setTextRange(
          ts.createBinary(node.left, ts.SyntaxKind.EqualsEqualsToken, node.right),
          node
        );
      }

      if (
        ts.isBinaryExpression(node) &&
        node.operatorToken.kind === ts.SyntaxKind.EqualsEqualsToken
      ) {
        const isInTemplateOrCondition = parents(
          node,
          parent => ts.isConditionalExpression(parent) || ts.isTemplateExpression(parent)
        );
        // FIXME: causes infinnite loop
        // if (!isInTemplateOrCondition) {
        //   node = ts.setTextRange(
        //     ts.createConditional(
        //       node,
        //       ts.createTrue(),
        //       ts.createStringLiteral('')
        //     ),
        //     node
        //   );
        // }
      }

      // Convert !== to != for proper ruby
      if (
        ts.isBinaryExpression(node) &&
        node.operatorToken.kind === ts.SyntaxKind.ExclamationEqualsEqualsToken
      ) {
        node = ts.setTextRange(
          ts.createBinary(node.left, ts.SyntaxKind.ExclamationEqualsToken, node.right),
          node
        );
      }

      // Convert x / y into division
      if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.SlashToken) {
        node = replace(code`${node.left} | divided_by: ${node.right}`, node);
      }

      // Convert `foo && bar` to `foo and bar`
      if (
        ts.isBinaryExpression(node) &&
        node.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken
      ) {
        // If no parent is a TemplateExpression or BinaryExpression then convert to binary expression left ? right : ''
        const isInTemplateOrCondition = parents(
          node,
          parent => ts.isConditionalExpression(parent) || ts.isTemplateExpression(parent)
        );
        if (isInTemplateOrCondition) {
          node = replace(code`${node.left} and ${node.right}`, node);
        } else {
          node = ts.createConditional(node.left, node.right, ts.createIdentifier('undefined'));
        }
      }

      // Convert `foo || bar` to `foo or bar`
      if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.BarBarToken) {
        node = replace(code`${node.left} or ${node.right}`, node);
      }

      // Convert x + y into string concat
      if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken) {
        node = replace(code`${node.left} | append: ${node.right}`, node);
      }

      // Convert ternary to liquid control flow
      if (ts.isConditionalExpression(node)) {
        node = replace(
          code`{% if ${node.condition} %} {{ ${node.whenTrue} }} {% else %} {{ ${node.whenFalse} }} {% endif %}`,
          node
        );
      }

      if (currentNode !== node) {
        currentNode = node;
        updated = true;
      }
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
