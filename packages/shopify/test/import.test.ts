import {
  liquidToBuilder,
  liquidToAst,
  parsedLiquidToHtml,
  htmlToAst,
  htmlAstToBuilder,
} from '../src/functions/liquid-to-builder';
import * as productPage from './liquid/product.liquid';
import { debugLog, debugFile } from './modules/helpers';
import * as stringify from 'json-stringify-safe';

test('Product page', async () => {
  const parsedTemplateItems = liquidToAst(productPage);
  const html = parsedLiquidToHtml(parsedTemplateItems);
  const htmlNodes = htmlToAst(html);
  const blocks = htmlAstToBuilder(htmlNodes);

  const everything = { parsedTemplateItems, html, htmlNodes, blocks };
  debugLog('everything', everything);
  const ignoreKeys = new Set(['liquid', 'input']);
  await debugFile(
    'everything.json',
    stringify(everything, (key, value) => (ignoreKeys.has(key) ? undefined : value), 2)
  );
  expect(blocks).toBeTruthy();
});

test('Product page full', async () => {
  const blocks = liquidToBuilder(productPage);
  expect(blocks).toBeTruthy();
});
