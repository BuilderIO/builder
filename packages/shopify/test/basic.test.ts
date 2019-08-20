import { contentToLiquid } from '../src';
import * as simplePage from './pages/compare/simple.json';
import * as productPage from './pages/bindings/product.json';
import * as collectionPage from './pages/bindings/collection.json';
import * as fs from 'fs-extra-promise';

const LOG_BY_DEFAULT = false;
const LOG = process.env.LOG ? process.env.LOG === 'true' : LOG_BY_DEFAULT;

const OUTPUT_FILE_BY_DEFAULT = true;
const OUTPUT_FILE = process.env.OUTPUT_FILE
  ? process.env.OUTPUT_FILE === 'true'
  : OUTPUT_FILE_BY_DEFAULT;

const outputRoot = './test/dist';

test('Simple page', async () => {
  const output = contentToLiquid(simplePage as any, 'page');

  // TODO: test against react render to string
  expect(output.html).toContain('<div');
});

test('Product page', async () => {
  const output = contentToLiquid(productPage as any, 'page');
  if (LOG) {
    console.log('liquid\n', output.html);
  }
  expect(output.html).toContain('<div');
  if (OUTPUT_FILE) {
    await fs.outputFileAsync(outputRoot + '/product.liquid', output.html);
  }
});

test('Collection page', async () => {
  const output = contentToLiquid(collectionPage as any, 'page');
  if (LOG) {
    console.log('liquid\n', output.html);
  }
  expect(output.html).toContain('<div');
  if (OUTPUT_FILE) {
    await fs.outputFileAsync(outputRoot + '/collection.liquid', output.html);
  }
});
