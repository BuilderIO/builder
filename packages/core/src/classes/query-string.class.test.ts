import { QueryString } from './query-string.class';

test.each([
  // prettier-ignore
  ['__proto__.foo.baz=1'],
  ['prototype.foo=1'],
])('(regression) prototype pollution %#', input => {
  expect(() => {
    QueryString.parseDeep(input);
  }).toThrowError(/Property name \".*\" is not allowed/);

  const pollutedObject: any = {};

  expect(pollutedObject.foo).toBeUndefined();
});

describe('.parseDeep', () => {
  test('input string may be prefixed with a question mark', () => {
    const result = QueryString.parseDeep('?foo=1');

    expect(result).toEqual({ foo: '1' });
  });

  test('converts the paths to a single object', () => {
    const result = QueryString.parseDeep('foo.bar.baz=1&foo.boo=2');

    expect(result).toEqual({ foo: { bar: { baz: '1' }, boo: '2' } });
  });
});
