import {
  liquidToBuilder,
  liquidToAst,
  parsedLiquidToHbs,
  handlebarsToBuilder,
} from '../src/functions/liquid-to-builder';
import { preprocess, AST } from '@glimmer/syntax';
import * as productPage from './liquid/product.liquid';

test('Product page', async () => {
  const parsedTemplateItems = liquidToAst(productPage);
  const hbs = parsedLiquidToHbs(parsedTemplateItems);
  const hbsProgram = preprocess(hbs);
  const blocks = handlebarsToBuilder(hbsProgram);
  expect(blocks).toBeTruthy();
});

test('Product page full', async () => {
  const blocks = liquidToAst(productPage);
  expect(blocks).toBeTruthy();
});
