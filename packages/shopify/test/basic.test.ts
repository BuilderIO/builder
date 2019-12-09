import { contentToLiquid } from '../src/functions/content-to-liquid';
import * as simplePage from './pages/compare/simple.json';
import * as productPage from './pages/bindings/product.json';
import * as collectionPage from './pages/bindings/collection.json';
import * as fs from 'fs-extra-promise';
import { debugLog, debugFile } from './modules/helpers';

test('Simple page', async () => {
  const output = contentToLiquid(simplePage as any, 'page');

  // TODO: test against react render to string
  expect(output.html).toContain('<div');
});

test('Product page', async () => {
  const output = contentToLiquid(productPage as any, 'page');

  debugLog('liquid\n', output.html);
  expect(output.html).toContain('<div');
  await debugFile('/product.liquid', output.html);
});

test('Collection page', async () => {
  const output = contentToLiquid(collectionPage as any, 'page');

  debugLog('liquid\n', output.html);
  expect(output.html).toContain('<div');
  await debugFile('/collection.liquid', output.html);
});
