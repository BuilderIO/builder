import {
  liquidToBuilder,
  liquidToAst,
  parsedLiquidToHtml,
  htmlToAst,
  htmlAstToBuilder,
} from '../src/functions/liquid-to-builder';
import { debugLog, debugFile } from './modules/helpers';
import * as stringify from 'json-stringify-safe';

let str = `
<div>
<div>Hello</div>
{% if foo == 'bar' %}
<div>Yo</div>
{% endif %}
</div>
`;

test('Playground', async () => {
  const parsedTemplateItems = liquidToAst(str);
  const html = await parsedLiquidToHtml(parsedTemplateItems, {});
  const htmlNodes = htmlToAst(html);
  const blocks = await htmlAstToBuilder(htmlNodes, {});

  const everything = { blocks, htmlNodes, html, parsedTemplateItems };
  const ignoreKeys = new Set(['liquid', 'input']);
  await debugFile(
    'playground.json',
    stringify(everything, (key, value) => (ignoreKeys.has(key) ? undefined : value), 2)
  );
  expect(blocks).toBeTruthy();
});
