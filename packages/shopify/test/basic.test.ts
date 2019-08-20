import { contentToLiquid } from '../src';
import * as simplePage from './pages/compare/simple.json';
import * as productPage from './pages/bindings/product-page.json';

const LOG_BY_DEFAULT = true;
const LOG = process.env.LOG ? process.env.LOG === 'true' : LOG_BY_DEFAULT;

it('Simple page', () => {
  const output = contentToLiquid(simplePage as any, 'page');

  // TODO: test against react render to string
  expect(output.html).toContain('<div');
});

it('Product page', () => {
  const output = contentToLiquid(productPage as any, 'page');
  if (LOG) {
    console.log('liquid\n', output.html);
  }
  expect(output.html).toContain('<div');
});
