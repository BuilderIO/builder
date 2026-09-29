import {
  getReadOnlyStateView,
  getSafeStateExpression,
  getSafeStateExpressionFn,
} from './safe-state-expression.js';

describe('getSafeStateExpression', () => {
  const SAFE = [
    'state.foo',
    '!state.isOpen',
    'state.$index + 1',
    'state.productsItem.onSale ? "red" : "black"',
    '"/p/" + state.item.slug',
    "state.plan === 'pro' && !state.trial",
    'state.count >= 10 || state.a.b != null',
    '(state.price * 1.2) - state.discount % 3',
    'state.name ?? "Anonymous"',
    '-state.offset',
    'state.a !== undefined',
    'state.x ? 1.5e3 : .5',
  ];
  const UNSAFE = [
    '',
    '1 + 1',
    'state',
    'state.constructor',
    'state.a.constructor.constructor("return process")()',
    'state.__proto__',
    'state.fn()',
    'state.fn (1)',
    '(state.fn)(1)',
    'state.a = 1',
    'state.a++',
    'state.a++ + 1',
    '--state.a',
    'state.a +',
    'state.a += 1',
    'state.list[0]',
    'state.list.map(x => x)',
    'state.a, state.b',
    'state.a; process.exit()',
    '`${state.a}`',
    'process.env.SECRET',
    'globalThis',
    'this.x',
    'context.x',
    'builder.isServer',
    'typeof state.a',
    'new state.A()',
    'state.a?.b',
    '"a\\" + process + "',
    'state.a + "multi\nline"',
    'state.a)',
    '(state.a',
    'state.a in state',
    '"abc".length',
    'x => state.a',
    'function () {}',
  ];

  SAFE.forEach((expression) => {
    test(`allows ${JSON.stringify(expression)}`, () => {
      expect(getSafeStateExpression(expression)).toBe(expression);
    });
  });
  UNSAFE.forEach((expression) => {
    test(`rejects ${JSON.stringify(expression)}`, () => {
      expect(getSafeStateExpression(expression)).toBeNull();
    });
  });
});

describe('getSafeStateExpressionFn', () => {
  const run = (code: string, rootState: any, localState?: any) =>
    getSafeStateExpressionFn(code)?.(
      getReadOnlyStateView(rootState, localState)
    );

  test('evaluates `parseCode` output and the editor transpiled form', () => {
    expect(run('return (state.a + 1);', { a: 1 })).toBe(2);
    expect(
      run('var _virtual_index=state.a ? "y" : "n";return _virtual_index', {
        a: true,
      })
    ).toBe('y');
  });

  test('reads local state over root state', () => {
    expect(
      run(
        'return (state.item.name + state.suffix);',
        { item: { name: 'root' }, suffix: '!' },
        { item: { name: 'local' } }
      )
    ).toBe('local!');
  });

  test('cannot write state', () => {
    const rootState = { a: 1 };
    const fn = getSafeStateExpressionFn('return (state.a);')!;
    const view: any = getReadOnlyStateView(rootState, undefined);
    expect(fn(view)).toBe(1);
    expect(() => {
      'use strict';
      view.a = 2;
    }).toThrow();
    expect(rootState.a).toBe(1);
  });

  test('returns null for code it does not handle', () => {
    expect(getSafeStateExpressionFn('state.a = 1')).toBeNull();
    expect(getSafeStateExpressionFn('return (state.a.toFixed(2));')).toBeNull();
    expect(getSafeStateExpressionFn('return (state.a // comment);')).toBeNull();
  });
});
