import { copyPlainData } from './copy-plain-data.js';

describe('copyPlainData', () => {
  test('copies plain objects and arrays deeply', () => {
    const source = { a: { b: [1, { c: 2 }] } };
    const copy = copyPlainData(source);
    expect(copy).toEqual(source);
    expect(copy.a).not.toBe(source.a);
    expect(copy.a.b[1]).not.toBe(source.a.b[1]);
  });

  test('keeps an own __proto__ key as data instead of changing the prototype', () => {
    const source = JSON.parse('{"__proto__": {"isAdmin": true}, "a": 1}');
    const copy: any = copyPlainData(source);
    expect(Object.getPrototypeOf(copy)).toBe(Object.prototype);
    expect(Object.keys(copy)).toEqual(['__proto__', 'a']);
    expect(copy.isAdmin).toBeUndefined();
  });
});
