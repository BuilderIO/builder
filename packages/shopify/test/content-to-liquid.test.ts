import { contentToLiquid } from '../src/functions/content-to-liquid';
import * as simplePage from './pages/compare/simple.json';
import * as productPage from './pages/bindings/product.json';
import * as collectionPage from './pages/bindings/collection.json';

test('Simple page', async () => {
  const output = contentToLiquid(simplePage as any, 'page', { useBuilderSignature: false });
  expect(output.html).toMatchSnapshot();
});

test('Product page', async () => {
  const output = contentToLiquid(productPage as any, 'page', { useBuilderSignature: false });
  expect(output.html).toMatchSnapshot();
});

test('Collection page', async () => {
  const output = contentToLiquid(collectionPage as any, 'page', { useBuilderSignature: false });
  expect(output.html).toMatchSnapshot();
});
