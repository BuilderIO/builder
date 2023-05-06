import { PROTO_STATE, flattenState } from './evaluate';

describe('flatten state', () => {
  it('should behave normally when no PROTO_STATE', () => {
    const state = { foo: 'bar' };
    const flattened = flattenState(state);
    expect(flattened.foo).toEqual('bar');
    flattened.foo = 'baz';
    expect(state.foo).toEqual('baz');
  });

  it('should write to root', () => {
    const state = { [PROTO_STATE]: { foo: 'baz' } };
    const flattened = flattenState(state);
    flattened.foo = 'bar';
    flattened.other = 'other';
    expect(state).toEqual({ [PROTO_STATE]: { foo: 'bar', other: 'other' } });
  });

  it('should shadow write ', () => {
    const state = { foo: 'foo', [PROTO_STATE]: { foo: 'baz' } };
    const flattened = flattenState(state);
    flattened.foo = 'bar';
    expect(state).toEqual({ foo: 'bar', [PROTO_STATE]: { foo: 'baz' } });
  });
});
