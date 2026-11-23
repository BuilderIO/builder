import { unflatten } from './flatten.js';

describe('unflatten', () => {
  afterEach(() => {
    delete (Object.prototype as any).polluted;
    delete (Object.prototype.toString as any).polluted;
  });

  test('rebuilds nested objects from dot-separated keys', () => {
    expect(unflatten({ 'foo.bar': 'baz', 'foo.qux': 1, top: true })).toEqual({
      foo: { bar: 'baz', qux: 1 },
      top: true,
    });
  });

  test('keeps numeric segments as object keys', () => {
    expect(unflatten({ 'list.0': 'x', 'list.5': 'y' })).toEqual({
      list: { 0: 'x', 5: 'y' },
    });
  });

  test.each([
    '__proto__.polluted',
    'foo.__proto__.polluted',
    'constructor.prototype.polluted',
    'foo.constructor.prototype.polluted',
    'foo.prototype.polluted',
  ])('does not pollute Object.prototype via %s', (key) => {
    expect(unflatten({ [key]: 'yes', safe: 'kept' })).toEqual({ safe: 'kept' });
    expect(({} as any).polluted).toBeUndefined();
    expect((Object as any).polluted).toBeUndefined();
  });

  test('does not write onto inherited members', () => {
    const result = unflatten({ 'toString.polluted': 'yes' });

    expect((Object.prototype.toString as any).polluted).toBeUndefined();
    expect(result.toString).toEqual({ polluted: 'yes' });
  });

  test('replaces a primitive when a later key nests under it', () => {
    expect(unflatten({ foo: 'bar', 'foo.baz': 'qux' })).toEqual({
      foo: { baz: 'qux' },
    });
  });
});
