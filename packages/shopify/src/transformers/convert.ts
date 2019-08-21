import * as ts from 'typescript';

export const TEMPLATE_START_TOKEN = '%%TEMPLATE_START%%';
export const PART_START_TOKEN = '%%TEMPLATE_PART_START%%';
export const PART_END_TOKEN = '%%TEMPLATE_PART_END%%';
export const TEMPLATE_END_TOKEN = '%%TEMPLATE_END%%';

const code = (parts: TemplateStringsArray, ...nodes: ts.Expression[]) => {
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

const replace = (oldNode: ts.Node, newNode: ts.Node): ts.Node => ts.setTextRange(newNode, oldNode)

function transform(context: ts.TransformationContext) {
  const previousOnSubstituteNode = context.onSubstituteNode;

  context.enableSubstitution(ts.SyntaxKind.ConditionalExpression);
  context.enableSubstitution(ts.SyntaxKind.BinaryExpression);
  context.enableSubstitution(ts.SyntaxKind.Identifier);

  context.onSubstituteNode = (hint, node) => {
    node = previousOnSubstituteNode(hint, node);

    // Convert `undefined` to `''`
    if (ts.isIdentifier(node) && node.text === 'undefined') {
      node = ts.setTextRange(ts.createStringLiteral(''), node);
    }

    // Convert === to == for proper ruby
    else if (
      ts.isBinaryExpression(node) &&
      node.operatorToken.kind === ts.SyntaxKind.EqualsEqualsEqualsToken
    ) {
      node = ts.setTextRange(
        ts.createBinary(node.left, ts.SyntaxKind.EqualsEqualsToken, node.right),
        node
      );
    }

    // Convert x / y into division
    else if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.SlashToken) {
      node = replace(code`${node.left} | divided_by: ${node.right}`, node);
    }

    // Convert x + y into string concat
    else if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken) {
      node = replace(code`${node.left} | append: ${node.right}`, node);
    }

    // Convert ternary to liquid control flow
    else if (ts.isConditionalExpression(node)) {
      node = replace(
        code`{% if ${node.condition} %} {{ ${node.whenTrue} }} {% else %} {{ ${node.whenFalse} }} {% endif %}`,
        node
      );
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
