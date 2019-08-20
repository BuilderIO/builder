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
  const result = convertTsToLiquid('foo == bar ? baz : bat');
  expect(result.trim()).toEqual('`{% if${foo == bar}%}{{${baz}}}{% else %}{{${bat}}}{% endif %}`');
});

test('Unwrap template strings', async () => {
  const result = convertTemplateLiteralsToTags(
    '{{ `{% if${state.activeSlide == state.$index}%}{{${1}}}{% else %}{{${0.3}}}{% endif %}` }}'
  );
  expect(stripWhitespace(result)).toEqual(
    stripWhitespace(
      '{% if state.activeSlide == state.$index %} {{ 1 }} {% else %} {{ 0.3 }} {% endif %}'
    )
  );
});

test('Unwrap template filter strings', async () => {
  const result = convertTemplateLiteralsToTags(
    "{{ `{{${'$'}| append: ${`${product.price}| divided_by: ${100}`}}}` }}"
  );
  expect(stripWhitespace(result)).toEqual(
    stripWhitespace(
      "{{ '$' | append: product.price | divided_by: 100 }}"
    )
  );
});

"{{'$'}|append:`product.price}|divided_by:100}`}}}"

// {{ `{% if${foo == bar}%}{{${baz}}}{% else %}{{${bat}}}{% endif %} }}`
// {% if foo == bar %} {{ baz }} {% else %} {{ bat }} {% endif %}
