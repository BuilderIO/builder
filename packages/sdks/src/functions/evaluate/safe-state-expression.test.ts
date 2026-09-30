import { types } from 'node:util';
import {
  evaluateSafeStateExpression,
  getReadOnlyStateView,
  getSafeStateExpression,
  getSafeStateExpressionFn,
  NOT_EVALUATED,
} from './safe-state-expression.js';

const { isProxy } = types;

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

describe('evaluateSafeStateExpression', () => {
  const run = (code: string, rootState: any, localState?: any) =>
    evaluateSafeStateExpression(code, rootState, localState, isProxy);

  test('evaluates primitive results over plain state', () => {
    expect(run('return (state.a.b + 1);', { a: { b: 1 } })).toBe(2);
    expect(run('return (state.list.length);', { list: [1, 2] })).toBe(2);
  });

  test('leaves object results to the sandbox', () => {
    expect(run('return (state.a || state.b);', { a: { x: 1 }, b: 2 })).toBe(
      NOT_EVALUATED
    );
  });

  test('does not run getters in state', () => {
    let calls = 0;
    const user = {
      get name() {
        calls++;
        return 'x';
      },
    };
    expect(run('return (state.user.name);', { user })).toBe(NOT_EVALUATED);
    expect(calls).toBe(0);
  });

  test('does not call custom valueOf or class instances', () => {
    const valueOf = vi.fn(() => 1);
    expect(run('return (state.a + 1);', { a: { valueOf } })).toBe(
      NOT_EVALUATED
    );
    expect(valueOf).not.toHaveBeenCalled();

    class Money {
      amount = 1;
    }
    expect(run('return (state.price.amount);', { price: new Money() })).toBe(
      NOT_EVALUATED
    );
  });

  test('keeps object identity for strict equality', () => {
    const items = { a: 1 };
    expect(run('return (state.items === state.items);', { items })).toBe(true);
    expect(run('return (state.a === state.b);', { a: items, b: items })).toBe(
      true
    );
    expect(
      run('return (state.a !== state.c);', { a: items, c: { a: 1 } })
    ).toBe(true);
  });

  test('does not run getters inherited from a prototype', () => {
    let calls = 0;
    Object.defineProperty(Object.prototype, 'inheritedGetter', {
      configurable: true,
      get() {
        calls++;
        return 'x';
      },
    });
    try {
      expect(run('return (state.user.inheritedGetter);', { user: {} })).toBe(
        NOT_EVALUATED
      );
      expect(calls).toBe(0);
    } finally {
      delete (Object.prototype as any).inheritedGetter;
    }
  });

  test('does not run Proxy traps in state', () => {
    let traps = 0;
    const user = new Proxy(
      { name: 'x' },
      {
        getPrototypeOf: (target) => {
          traps++;
          return Object.getPrototypeOf(target);
        },
        getOwnPropertyDescriptor: (target, prop) => {
          traps++;
          return Reflect.getOwnPropertyDescriptor(target, prop);
        },
      }
    );
    expect(run('return (state.user.name);', { user })).toBe(NOT_EVALUATED);
    expect(traps).toBe(0);
  });

  test('leaves values that fail primitive coercion to the regular evaluator', () => {
    const value = Object.create(null);
    value.a = 1;
    expect(run('return (state.value + 1);', { value })).toBe(NOT_EVALUATED);
  });

  test('reads frozen state', () => {
    const rootState = Object.freeze({ a: Object.freeze({ b: 'y' }) });
    expect(run('return (state.a.b);', rootState)).toBe('y');
  });

  test('returns NOT_EVALUATED for code it does not handle', () => {
    expect(run('state.a = 1', { a: 1 })).toBe(NOT_EVALUATED);
  });
});

describe('getSafeStateExpressionFn', () => {
  const run = (code: string, rootState: any, localState?: any) =>
    getSafeStateExpressionFn(code)?.(
      getReadOnlyStateView(rootState, localState, isProxy)
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
    const view: any = getReadOnlyStateView(rootState, undefined, isProxy);
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
