import { convertTsToLiquid } from '../src/transformers/convert';
import { convertTemplateLiteralsToTags } from '../src/functions/content-to-liquid';

const stripWhitespace = (str: string) => str.replace(/\s/g, '');

test('Simple expression', async () => {
  const result = convertTsToLiquid('foo.bar');
  expect(result.trim()).toEqual('foo.bar');
});

test('Tripe to double equals', async () => {
  const result = convertTsToLiquid('foo === bar');
  expect(result.trim()).toEqual('foo == bar');
});

test('Ternary to {% if %}', async () => {
  const result = convertTemplateLiteralsToTags(convertTsToLiquid('foo === bar ? bar : baz'));
  expect(stripWhitespace(result)).toEqual(
    stripWhitespace(
      '{% if foo == bar %} {{bar}} {% else %} {{baz}} {% endif %}'
    )
  );
});

test('Expressions to filters', async () => {
  const result = convertTemplateLiteralsToTags(convertTsToLiquid('"$" + price / 100'));
  expect(stripWhitespace(result)).toEqual(
    stripWhitespace(
      '"$" | append: price | divided_by: 100'
    )
  );
});
