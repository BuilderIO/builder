import { describe, expect, it } from 'vitest';
import type { BuilderBlock } from '../types/builder-block';
import { resolveLocalizedValues } from './extract-localized-values';
import { fastClone } from './fast-clone';

const mockLocalizedValue = {
  '@type': '@builder.io/core:LocalizedValue',
  Default: 'Enter some text...',
  'hi-IN': 'kuch text enter kijiye',
  'es-ES': 'Hola',
  'en-US': 'Hello',
};

const mockNonLocalizedValue = 'static value';

const mockBlock: BuilderBlock = {
  '@type': '@builder.io/sdk:Element',
  id: 'test-block',
  component: {
    name: 'Text',
    options: {
      text: mockLocalizedValue,
      nonLocalizedField: mockNonLocalizedValue,
    },
  },
};

describe('Localized Values', () => {
  describe('resolveLocalizedValues', () => {
    it('should resolve localized values when locale is provided', () => {
      const result = resolveLocalizedValues(fastClone(mockBlock), 'en-US');
      expect(result.component?.options.text).toBe('Hello');
      expect(result.component?.options.nonLocalizedField).toBe(
        mockNonLocalizedValue
      );
    });

    it('should resolve to Default value when no locale is provided', () => {
      const result = resolveLocalizedValues(fastClone(mockBlock), undefined);
      expect(result.component?.options.text).toEqual(
        mockLocalizedValue.Default
      );
      expect(result.component?.options.nonLocalizedField).toBe(
        mockNonLocalizedValue
      );
    });

    it('should handle empty component options', () => {
      const emptyBlock: BuilderBlock = {
        '@type': '@builder.io/sdk:Element',
        id: 'empty-block',
        component: {
          name: 'Text',
          options: {},
        },
      };
      const result = resolveLocalizedValues(emptyBlock, 'en-US');
      expect(result).toEqual(emptyBlock);
    });

    it('should handle missing component options', () => {
      const noOptionsBlock: BuilderBlock = {
        '@type': '@builder.io/sdk:Element',
        id: 'no-options-block',
        component: {
          name: 'Text',
        },
      };
      const result = resolveLocalizedValues(noOptionsBlock, 'en-US');
      expect(result).toEqual(noOptionsBlock);
    });

    it('should handle null component', () => {
      const nullComponentBlock: BuilderBlock = {
        '@type': '@builder.io/sdk:Element',
        id: 'null-component-block',
      };
      const result = resolveLocalizedValues(nullComponentBlock, 'en-US');
      expect(result).toEqual(nullComponentBlock);
    });

    it('should handle non-existent locale', () => {
      const result = resolveLocalizedValues(fastClone(mockBlock), 'fr-FR');
      expect(result.component?.options.text).toBeUndefined();
      expect(result.component?.options.nonLocalizedField).toBe(
        mockNonLocalizedValue
      );
    });

    it('should handle nested localized values', () => {
      const nestedBlock: BuilderBlock = {
        '@type': '@builder.io/sdk:Element',
        id: 'nested-block',
        component: {
          name: 'NestedComponent',
          options: {
            nested: {
              text: mockLocalizedValue,
            },
          },
        },
      };
      const result = resolveLocalizedValues(nestedBlock, 'en-US');
      expect(result.component?.options.nested.text).toBe('Hello');
    });

    it('should handle subfields - nested fields having localized values', () => {
      const nestedBlock: BuilderBlock = {
        '@type': '@builder.io/sdk:Element',
        id: 'nested-block',
        component: {
          name: 'ListComponent',
          options: {
            myList: [
              {
                text: mockLocalizedValue,
              },
              {
                text: mockLocalizedValue,
              },
            ],
          },
        },
      };

      const result = resolveLocalizedValues(nestedBlock, 'en-US');
      expect(result.component?.options.myList[0].text).toBe('Hello');
      expect(result.component?.options.myList[1].text).toBe('Hello');
    });

    it('should never mutate the block it is given', () => {
      const block = deepFreeze(fastClone(mockBlock));
      const french = resolveLocalizedValues(block, 'es-ES');
      const english = resolveLocalizedValues(block, 'en-US');
      expect(french.component?.options.text).toBe('Hola');
      expect(english.component?.options.text).toBe('Hello');
      expect(block.component?.options.text).toEqual(mockLocalizedValue);
    });

    it('should return the same block when nothing is localized', () => {
      const block: BuilderBlock = {
        '@type': '@builder.io/sdk:Element',
        component: { name: 'Text', options: { text: 'hi', list: [{ a: 1 }] } },
      };
      expect(resolveLocalizedValues(block, 'en-US')).toBe(block);
    });

    it('should only copy the objects on the way to a localized value', () => {
      const untouched = { deep: { value: 1 } };
      const block: BuilderBlock = {
        '@type': '@builder.io/sdk:Element',
        component: {
          name: 'Custom',
          options: { untouched, list: [{ label: mockLocalizedValue }] },
        },
      };
      const result = resolveLocalizedValues(block, 'en-US');
      expect(result.component?.options.untouched).toBe(untouched);
      expect(result.component?.options.list[0].label).toBe('Hello');
    });

    it('should resolve localized values nested in nested blocks and locale values', () => {
      const block: BuilderBlock = {
        '@type': '@builder.io/sdk:Element',
        component: {
          name: 'Columns',
          options: {
            columns: [
              {
                blocks: [
                  {
                    '@type': '@builder.io/sdk:Element',
                    component: {
                      name: 'Text',
                      options: { text: mockLocalizedValue },
                    },
                  },
                ],
              },
            ],
            card: {
              '@type': '@builder.io/core:LocalizedValue',
              'en-US': { title: mockLocalizedValue },
            },
          },
        },
      };
      const result = resolveLocalizedValues(block, 'en-US');
      expect(
        result.component?.options.columns[0].blocks[0].component.options.text
      ).toBe('Hello');
      expect(result.component?.options.card.title).toBe('Hello');
    });

    it('should handle circular references', () => {
      const options: any = { text: mockLocalizedValue };
      options.self = options;
      const block: BuilderBlock = {
        '@type': '@builder.io/sdk:Element',
        component: { name: 'Text', options },
      };
      const result = resolveLocalizedValues(block, 'en-US');
      expect(result.component?.options.text).toBe('Hello');
    });
  });
});

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}
