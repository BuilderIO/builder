import * as ts from 'typescript';

function transform(context: ts.TransformationContext) {
  const previousOnSubstituteNode = context.onSubstituteNode;
  context.enableSubstitution(ts.SyntaxKind.ConditionalExpression);
  context.enableSubstitution(ts.SyntaxKind.BinaryExpression);
  context.onSubstituteNode = (hint, node) => {
    node = previousOnSubstituteNode(hint, node);
    // Convert === to ==
    if (
      ts.isBinaryExpression(node) &&
      node.operatorToken.kind === ts.SyntaxKind.EqualsEqualsEqualsToken
    ) {
      node = ts.setTextRange(
        ts.createBinary(node.left, ts.SyntaxKind.EqualsEqualsToken, node.right),
        node
      );
    }

    // Convert ternary to liquid control flow
    if (ts.isConditionalExpression(node)) {
      node = ts.setTextRange(ts.createTemplateExpression(ts.createTemplateHead('{% if'), [
        ts.createTemplateSpan(node.condition, ts.createTemplateMiddle('%}{{')),
        ts.createTemplateSpan(node.whenTrue, ts.createTemplateMiddle('}}{% else %}{{')),
        ts.createTemplateSpan(node.whenFalse, ts.createTemplateTail('}}{% endif %}'))
      ]), node);
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
      compilerOptions: {
        //
      },
    })
    .outputText.trim()
    .replace(/;$/, '');
}
