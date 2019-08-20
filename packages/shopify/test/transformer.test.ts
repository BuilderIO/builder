import { convertTsToLiquid } from '../src/transformers/convert';
import { convertTemplateLiteralsToTags } from '../src/functions/content-to-liquid';

const LOG_TRANSFORMS_BY_DEFAULT = true;
const LOG_TRANSFORMS = process.env.LOG_TRANSFORMS
  ? process.env.LOG_TRANSFORMS === 'true'
  : LOG_TRANSFORMS_BY_DEFAULT;

it('Simple expression', async () => {
  const result = convertTsToLiquid('foo.bar');
  expect(result.trim()).toEqual('foo.bar');
});

it('Tripe to double equals', async () => {
  const result = convertTsToLiquid('foo === bar');
  expect(result.trim()).toEqual('foo == bar');
});

it('Ternary to {% if %}', async () => {
  const result = convertTsToLiquid('foo == bar ? baz : bat');
  expect(result.trim()).toEqual('`{% if${foo == bar}%}{{${baz}}}{% else %}{{${bat}}}{% endif %}`');
});

it('Unwrap template strings', async () => {
  const result = convertTemplateLiteralsToTags(
    '{{ `{% if${state.activeSlide == state.$index}%}{{${1}}}{% else %}{{${0.3}}}{% endif %}` }}'
  );
  expect(result.trim()).toEqual('{% if state.activeSlide == state.$index %} {{ 1 }} {% else %} {{ 0.3 }} {% endif %}');
});

// {{ `{% if${foo == bar}%}{{${baz}}}{% else %}{{${bat}}}{% endif %} }}`
// {% if foo == bar %} {{ baz }} {% else %} {{ bat }} {% endif %}
