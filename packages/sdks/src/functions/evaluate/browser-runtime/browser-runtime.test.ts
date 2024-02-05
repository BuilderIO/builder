import { flattenState } from './browser.js';

describe('flatten state', () => {
  it('should behave normally when no PROTO_STATE', () => {
    const localState = {};
    const rootState = { foo: 'bar' };
    const flattened = flattenState({
      rootState,
      localState,
      rootSetState: undefined,
    });
    expect(flattened.foo).toEqual('bar');
    flattened.foo = 'baz';
    expect(rootState.foo).toEqual('baz');
  });

  it('should shadow write ', () => {
    const rootState = { foo: 'foo' };
    const localState = { foo: 'baz' };
    const flattened = flattenState({
      rootState,
      localState,
      rootSetState: undefined,
    });
    expect(() => (flattened.foo = 'bar')).toThrow(
      'Writing to local state is not allowed as it is read-only.'
    );
  });
});
