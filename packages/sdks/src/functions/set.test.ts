import { set } from './set.js';

test('can shallow set a property', () => {
  const obj = { foo: 'bar' };
  set(obj, 'foo', 'baz');
  expect(obj.foo).toBe('baz');
});

test('can deeply set a property', () => {
  const obj = { foo: 'bar' };
  set(obj, 'foo.bar', 'baz');
  expect((obj.foo as any).bar).toBe('baz');
});

test('can deeply create arrays', () => {
  const obj = { foo: 'bar' };
  set(obj, 'foo.bar.0', 'hi');
  expect((obj.foo as any).bar).toEqual(['hi']);
});

test.each([
  '__proto__.polluted',
  'constructor.prototype.polluted',
  'foo.__proto__.polluted',
  '__proto__[polluted]',
])('does not pollute Object.prototype via %s', (path) => {
  const obj = {};
  set(obj, path, 'yes');
  expect(({} as any).polluted).toBeUndefined();
  expect((Object.prototype as any).polluted).toBeUndefined();
});

test('does not pollute Object.prototype via array path', () => {
  set({}, ['__proto__', 'polluted'], 'yes');
  expect(({} as any).polluted).toBeUndefined();
});
