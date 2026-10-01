import { describe, expect, test } from 'vitest';
import { isSymbolContentInlinedInParent } from './symbol.helpers.js';

const symbol = { model: 'symbol', content: { data: { blocks: [] } } };

describe('isSymbolContentInlinedInParent', () => {
  test('inlined when the symbol has content and no content binding', () => {
    expect(isSymbolContentInlinedInParent(symbol, undefined)).toBe(true);
    expect(
      isSymbolContentInlinedInParent(symbol, {
        'component.options.symbol.data.title': 'state.title',
      })
    ).toBe(true);
  });

  test('not inlined without content', () => {
    expect(isSymbolContentInlinedInParent({ model: 'symbol' }, undefined)).toBe(
      false
    );
    expect(isSymbolContentInlinedInParent(undefined, undefined)).toBe(false);
  });

  test('not inlined when the symbol or its content comes from a binding', () => {
    for (const key of [
      'component.options.symbol',
      'component.options.symbol.content',
      'component.options.symbol.content.data.blocks',
      'options.symbol',
    ]) {
      expect(
        isSymbolContentInlinedInParent(symbol, { [key]: 'state.symbol' })
      ).toBe(false);
    }
  });
});
