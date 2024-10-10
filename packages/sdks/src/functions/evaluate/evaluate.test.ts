import { runInBrowser } from './browser-runtime/browser';
import { runInEdge } from './edge-runtime/edge-runtime';
import type { ExecutorArgs } from './helpers';
import { getBuilderGlobals, parseCode } from './helpers';
import { runInNode } from './node-runtime/node-runtime';

const DEFAULTS = {
  builder: getBuilderGlobals(),
  context: {},
  event: undefined,
  localState: {},
  rootSetState: () => {},
  rootState: {},
};

const getEval = () => {
  switch (process.env.SDK_ENV) {
    case 'browser':
      return runInBrowser;
    case 'node':
      return runInNode;
    case 'edge':
      return runInEdge;
    default:
      throw new Error('Invalid SDK_ENV');
  }
};
const evaluateCode = (args: ExecutorArgs) => {
  try {
    return getEval()(args);
  } catch (e: any) {
    console.error('Failed code evaluation: ' + e.message, args.code);
    throw e;
  }
};

const TESTS = {
  'does simple math': () => {
    const output = evaluateCode({
      ...DEFAULTS,
      code: parseCode('1 + 1', { isExpression: true }),
    });

    expect(output).toBe(2);
  },
  'returns state value': () => {
    const output = evaluateCode({
      ...DEFAULTS,
      code: parseCode('state.foo', { isExpression: true }),
      rootState: {
        foo: 'bar',
      },
    });

    expect(output).toBe('bar');
  },
  'returns nested state value': () => {
    const output = evaluateCode({
      ...DEFAULTS,
      code: parseCode('state.foo.bar.baz', { isExpression: true }),
      rootState: {
        foo: {
          bar: {
            baz: 'qux',
          },
        },
      },
    });

    expect(output).toBe('qux');
  },
  'returns nested local state value': () => {
    const output = evaluateCode({
      ...DEFAULTS,
      code: parseCode('state.foo[0].bar.baz', { isExpression: true }),
      localState: {
        foo: [
          {
            bar: {
              baz: 'qux',
            },
          },
        ],
      },
    });

    expect(output).toBe('qux');
  },
  'sets simple state value (using `rootSetState`)': () => {
    const rootState = {
      foo: 'bar',
    };

    runInNode({
      ...DEFAULTS,
      code: parseCode('state.foo = "baz"', { isExpression: true }),
      rootState,
      rootSetState: (newState) => {
        Object.assign(rootState, newState);
      },
    });

    expect(rootState.foo).toBe('baz');
  },
  'sets simple state value (if `rootState` is mutable)': () => {
    const rootState = {
      foo: 'bar',
    };

    runInNode({
      ...DEFAULTS,
      code: parseCode('state.foo = "baz"', { isExpression: true }),
      rootState,
      rootSetState: undefined,
    });

    expect(rootState.foo).toBe('baz');
  },
  'set & read simple state value (if `rootState` is mutable)': () => {
    const rootState: {
      a?: number;
      b?: number;
    } = {};

    const output = evaluateCode({
      ...DEFAULTS,
      code: parseCode(
        `
        state.a = 10;
        state.b = state.a + 4;
        var x = state.b;

        return x
      `,
        { isExpression: true }
      ),
      rootState,
      rootSetState: undefined,
    });

    expect(rootState.a).toBe(10);
    expect(rootState.b).toBe(14);
    expect(output).toBe(14);
  },
  'set & read simple state value (with `rootSetState`)': () => {
    const rootState: {
      a?: number;
      b?: number;
    } = {};

    const output = evaluateCode({
      ...DEFAULTS,
      code: parseCode(
        `
        state.a = 10;
        state.b = state.a + 4;
        var x = state.b;

        return x
      `,
        { isExpression: true }
      ),
      rootState,
      rootSetState: (newState) => {
        Object.assign(rootState, newState);
      },
    });

    expect(rootState.a).toBe(10);
    expect(rootState.b).toBe(14);
    expect(output).toBe(14);
  },
  'set Array state value (if `rootState` is mutable)': () => {
    const rootState: { a?: number[] } = {};

    runInNode({
      ...DEFAULTS,
      code: parseCode(`state.a = [10, 43];`, { isExpression: true }),
      rootState,
    });

    expect(rootState.a).toBeInstanceOf(Array);
    expect(rootState.a).toHaveLength(2);
    expect(rootState.a?.[0]).toBe(10);
    expect(rootState.a?.[1]).toBe(43);
  },
};

describe(`evaluate (${process.env.SDK_ENV})`, () => {
  describe('individual evaluations', () => {
    Object.keys(TESTS).forEach((key) => {
      test(key, () => {
        TESTS[key as keyof typeof TESTS]();
      });
    });
  });
  test('successfully runs multiple evaluations in random order', () => {
    const keys = Object.keys(TESTS);
    const randomKeys = keys.sort(() => Math.random() - 0.5);

    randomKeys.forEach((key) => {
      TESTS[key as keyof typeof TESTS]();
    });
  });
});
