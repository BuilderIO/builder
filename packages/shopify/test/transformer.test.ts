import { convertTsToLiquid } from '../src/transformers/convert';
import { convertTemplateLiteralsToTags } from '../src/functions/content-to-liquid';

const stripWhitespace = (str: string) => str.replace(/\s/g, '');

const tsToLiquid = (str: string) => convertTemplateLiteralsToTags(convertTsToLiquid(str));

test('Simple expression', async () => {
  const result = tsToLiquid('foo.bar');
  expect(result.trim()).toEqual('foo.bar');
});

test('Tripe to double equals', async () => {
  const result = tsToLiquid('foo === bar');
  expect(result.trim()).toEqual('foo == bar');
});

test('&& to ternary', async () => {
  const result = tsToLiquid('foo && bar');
  expect(result.trim()).toEqual('{% if foo %} {{ bar }} {% else %} {{ "" }} {% endif %}');
});

test('|| to or', async () => {
  const result = tsToLiquid('foo || bar');
  expect(result.trim()).toEqual('foo or bar');
});

test('Undefined to ""', async () => {
  const result = tsToLiquid('undefined');
  expect(result.trim()).toEqual('""');
});

test('Ternary to {% if %}', async () => {
  const result = tsToLiquid('foo && bar ? bar : baz');
  expect(stripWhitespace(result)).toEqual(
    stripWhitespace('{% if foo and bar %} {{bar}} {% else %} {{baz}} {% endif %}')
  );
});

test('Expressions to filters', async () => {
  const result = tsToLiquid('"$" + price / 100');
  expect(stripWhitespace(result)).toEqual(stripWhitespace('"$" | append: price | divided_by: 100'));
});
