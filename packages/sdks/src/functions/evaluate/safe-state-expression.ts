/**
 * Recognizes binding expressions that only read `state` and combine the values
 * with operators and literals, e.g. `!state.open`, `state.$index + 1` or
 * `state.plan === "pro" ? "Upgrade" : "Manage"`. Such an expression cannot call
 * functions, assign, loop or reach any global, so it can run as a plain function
 * instead of in a sandbox. Anything else returns `null` and is sandboxed as usual.
 */

const IDENTIFIER = /^[A-Za-z_$][\w$]*/;
const NUMBER = /^(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/;

/**
 * The length of a single- or double-quoted string literal at the start of `code`
 * (no escapes or line breaks), or 0 when there is none.
 */
const getStringLiteralLength = (code: string) => {
  const quote = code[0];
  if (quote !== '"' && quote !== "'") return 0;
  for (let i = 1; i < code.length; i++) {
    const char = code[i];
    if (char === quote) return i + 1;
    if (char === '\\' || char === '\n' || char === '\r') return 0;
  }
  return 0;
};
const OPERATORS = [
  '===',
  '!==',
  '==',
  '!=',
  '<=',
  '>=',
  '&&',
  '||',
  '??',
  '<',
  '>',
  '!',
  '+',
  '-',
  '*',
  '/',
  '%',
  '?',
  ':',
];
const LITERAL_KEYWORDS = new Set(['true', 'false', 'null', 'undefined']);
// Reading these is harmless on data, but they lead to functions and prototypes.
const BLOCKED_PROPERTIES = new Set([
  'constructor',
  '__proto__',
  'prototype',
  '__defineGetter__',
  '__defineSetter__',
  '__lookupGetter__',
  '__lookupSetter__',
]);

const MAX_EXPRESSION_LENGTH = 500;

/**
 * Returns `expression` when it only uses the allowed grammar, otherwise `null`.
 */
export const getSafeStateExpression = (expression: string): string | null => {
  if (expression.length > MAX_EXPRESSION_LENGTH) return null;
  let rest = expression.trim();
  if (!rest) return null;

  let depth = 0;
  // A value (state path, literal or closing paren) was just read: `(` here would be a call.
  let afterValue = false;
  let readsState = false;

  while (rest) {
    const whitespace = /^\s+/.exec(rest);
    if (whitespace) {
      rest = rest.slice(whitespace[0].length);
      continue;
    }

    const identifier = IDENTIFIER.exec(rest);
    if (identifier) {
      if (afterValue) return null;
      const word = identifier[0];
      rest = rest.slice(word.length);
      if (LITERAL_KEYWORDS.has(word)) {
        afterValue = true;
        continue;
      }
      if (word !== 'state') return null;
      let hasProperty = false;
      let property = /^\s*\.\s*([A-Za-z_$][\w$]*)/.exec(rest);
      while (property) {
        if (BLOCKED_PROPERTIES.has(property[1])) return null;
        hasProperty = true;
        rest = rest.slice(property[0].length);
        property = /^\s*\.\s*([A-Za-z_$][\w$]*)/.exec(rest);
      }
      if (!hasProperty) return null;
      readsState = true;
      afterValue = true;
      continue;
    }

    const literalLength =
      NUMBER.exec(rest)?.[0].length || getStringLiteralLength(rest);
    if (literalLength) {
      if (afterValue) return null;
      rest = rest.slice(literalLength);
      afterValue = true;
      continue;
    }

    if (rest[0] === '(') {
      if (afterValue) return null;
      depth++;
      rest = rest.slice(1);
      continue;
    }
    if (rest[0] === ')') {
      if (depth === 0) return null;
      depth--;
      rest = rest.slice(1);
      afterValue = true;
      continue;
    }

    const operator = OPERATORS.find((op) => rest.startsWith(op));
    if (!operator) return null;
    // `?.` is optional chaining (a property access we do not handle)
    if (operator === '?' && rest[1] === '.') return null;
    // `++` / `--` would write to state
    if ((operator === '+' || operator === '-') && rest[1] === operator) {
      return null;
    }
    rest = rest.slice(operator.length);
    afterValue = false;
  }

  if (depth !== 0 || !readsState || !afterValue) return null;
  return expression.trim();
};

const RETURN_EXPRESSION = /^\s*return\s*\(([\s\S]*)\);\s*$/;
const VIRTUAL_INDEX_EXPRESSION =
  /^\s*var\s+_virtual_index\s*=\s*([\s\S]*?);?\s*return\s+_virtual_index\s*;?\s*$/;

/**
 * Extracts the expression from code produced by `parseCode` (`return (expr);`) or
 * from the editor's transpiled form (`var _virtual_index=expr;` followed by a return of it).
 * (Mitosis treats any file containing a literal "return" + " _virtual_index" as a function body.)
 */
export const getSafeStateExpressionFromCode = (code: string) => {
  const match =
    RETURN_EXPRESSION.exec(code) || VIRTUAL_INDEX_EXPRESSION.exec(code);
  return match ? getSafeStateExpression(match[1]) : null;
};

type SafeExpressionFn = (state: Record<string, any>) => unknown;

const MAX_CACHED_EXPRESSIONS = 5000;
const COMPILED_EXPRESSIONS = new Map<string, SafeExpressionFn | null>();

/**
 * The compiled expression for `code`, or `null` when `code` is not a safe state expression.
 */
export const getSafeStateExpressionFn = (
  code: string
): SafeExpressionFn | null => {
  let fn = COMPILED_EXPRESSIONS.get(code);
  if (fn === undefined) {
    const expression = getSafeStateExpressionFromCode(code);
    fn = null;
    if (expression) {
      try {
        fn = new Function(
          'state',
          `return (${expression});`
        ) as SafeExpressionFn;
      } catch (e) {
        fn = null;
      }
    }
    if (COMPILED_EXPRESSIONS.size >= MAX_CACHED_EXPRESSIONS) {
      COMPILED_EXPRESSIONS.clear();
    }
    COMPILED_EXPRESSIONS.set(code, fn);
  }
  return fn;
};

/**
 * A read-only view of local state over root state, without copying either.
 */
export const getReadOnlyStateView = (
  rootState: Record<string | symbol, any>,
  localState: Record<string | symbol, any> | undefined
) =>
  new Proxy(
    {},
    {
      get: (_, prop) =>
        localState && Object.prototype.hasOwnProperty.call(localState, prop)
          ? localState[prop]
          : rootState[prop],
      set: () => false,
      deleteProperty: () => false,
    }
  );
