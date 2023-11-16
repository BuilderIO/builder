import { getBuilderGlobals, parseCode } from '../helpers';
import { runInNode } from './node-runtime';

const DEFAULTS = {
  builder: getBuilderGlobals(),
  context: {},
  event: undefined,
  localState: {},
  rootSetState: () => {},
  rootState: {},
};

describe('node-runtime', () => {
  test('does simple math', async () => {
    const output = runInNode({
      ...DEFAULTS,
      code: parseCode('1 + 1', { isExpression: true }),
    });

    expect(output).toBe(2);
  });
  test('returns state value', async () => {
    const output = runInNode({
      ...DEFAULTS,
      code: parseCode('state.foo', { isExpression: true }),
      rootState: {
        foo: 'bar',
      },
    });

    expect(output).toBe('bar');
  });
  test('returns nested state value', async () => {
    const output = runInNode({
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
  });
  test('returns nested local state value', async () => {
    const output = runInNode({
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
  });
  test('sets simple state value (using `rootSetState`)', async () => {
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
  });
  test('sets simple state value (if `rootState` is mutable)', async () => {
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
  });
  test('set & read simple state value (if `rootState` is mutable)', async () => {
    const rootState: {
      a?: number;
      b?: number;
    } = {};

    const output = runInNode({
      ...DEFAULTS,
      code: parseCode(
        `
        state.a = 10;
        state.b = state.a + 4;
        const x = state.b;

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
  });
  test('set & read simple state value (with `rootSetState`)', async () => {
    const rootState: {
      a?: number;
      b?: number;
    } = {};

    const output = runInNode({
      ...DEFAULTS,
      code: parseCode(
        `
        state.a = 10;
        state.b = state.a + 4;
        const x = state.b;

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
  });
  test('set Array state value (if `rootState` is mutable)', async () => {
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
  });
});
