import { blockToLiquid } from '../src/functions/block-to-liquid';
import * as simpleRepeat from './pages/blocks/simple-repeat.json';
import * as interpolation from './pages/blocks/interpolation.json';
import * as conditionalAttr from './pages/blocks/conditionalAttr.json';
import * as simpleConditional from './pages/blocks/simple-conditional.json';
import * as unlessLoop from './pages/blocks/unless-loop.json';
import * as inputWithChecked from './pages/blocks/input-with-checked.json';

import { format } from 'prettier';

test('Simple repeat', async () => {
  const output = format(blockToLiquid(simpleRepeat as any), {
    parser: 'html',
  });
  expect(output).toMatchSnapshot();
});

test('Variable interpolation', async () => {
  const output = format(blockToLiquid(interpolation as any), {
    parser: 'html',
  });
  expect(output).toMatchSnapshot();
});

test('Conditional Attributes', async () => {
  const output = format(blockToLiquid(conditionalAttr as any), {
    parser: 'html',
  });
  expect(output).toMatchSnapshot();
});

test('Handles simple conditional', async () => {
  const output = format(blockToLiquid(simpleConditional as any), {
    parser: 'html',
  });
  expect(output).toMatchSnapshot();
});

test('Handles loop with unless statement', async () => {
  // Prettier has trouble with liquid tags and does not work
  // to format the output from this test
  const output = blockToLiquid(unlessLoop as any);
  expect(output).toMatchSnapshot();
});

test('Handles input with boolean attribute checked', async () => {
  const output = format(blockToLiquid(inputWithChecked as any), {
    parser: 'html',
  });
  expect(output).toMatchSnapshot();
});
