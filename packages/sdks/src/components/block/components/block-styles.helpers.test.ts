import type { BuilderBlock } from '../../../types/builder-block.js';
import type { BuilderContent } from '../../../types/builder-content.js';
import {
  getContentBlockStyles,
  isInContentBlockStyles,
} from './block-styles.helpers.js';

const block = (
  id: string,
  extra: Partial<BuilderBlock> = {}
): BuilderBlock => ({
  '@type': '@builder.io/sdk:Element',
  id,
  responsiveStyles: { large: { color: id } },
  ...extra,
});

const contentOf = (blocks: BuilderBlock[]): BuilderContent => ({
  data: { blocks },
});

describe('getContentBlockStyles', () => {
  test('collects static blocks, their children and blocks in component options', () => {
    const child = block('child');
    const inColumn = block('in-column');
    const content = contentOf([
      block('root', { children: [child] }),
      block('columns', {
        component: {
          name: 'Columns',
          options: { columns: [{ blocks: [inColumn] }] },
        },
      }),
    ]);
    const { css, ids } = getContentBlockStyles(content, undefined);
    expect([...ids].sort()).toEqual(['child', 'columns', 'in-column', 'root']);
    expect(css).toContain('.root {');
    expect(css).toContain('.in-column {');
    expect(isInContentBlockStyles(child, content, undefined)).toBe(true);
  });

  test('leaves blocks with bindings or repeats, and their duplicates, to render their own styles', () => {
    const bound = block('bound', { bindings: { 'style.color': 'state.c' } });
    const repeated = block('repeated', {
      repeat: { collection: 'state.items' },
    });
    const content = contentOf([
      bound,
      repeated,
      block('bound'),
      block('dupe'),
      block('dupe', { responsiveStyles: { large: { color: 'other' } } }),
    ]);
    const { ids } = getContentBlockStyles(content, undefined);
    expect(ids.size).toBe(0);
    expect(isInContentBlockStyles(bound, content, undefined)).toBe(false);
    expect(isInContentBlockStyles(repeated, content, undefined)).toBe(false);
  });

  test('does not walk into symbols or hidden blocks', () => {
    const content = contentOf([
      block('symbol', {
        component: {
          name: 'Symbol',
          options: { symbol: { content: contentOf([block('inner')]) } },
        },
      }),
      block('hidden', { hide: true, children: [block('hidden-child')] }),
    ]);
    const { css, ids } = getContentBlockStyles(content, undefined);
    expect([...ids].sort()).toEqual(['hidden', 'symbol']);
    expect(css).not.toContain('.hidden');
  });

  test('is memoized per content and locale', () => {
    const content = contentOf([block('a')]);
    const first = getContentBlockStyles(content, 'en');
    expect(getContentBlockStyles(content, 'en')).toBe(first);
    expect(getContentBlockStyles(content, 'fr')).not.toBe(first);
  });
});
