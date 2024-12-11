import { clone } from 'traverse';
import { describe, expect, it } from 'vitest';
import type { BuilderBlock } from '../types/builder-block';
import { resolveLocalizedValues } from './extract-localized-values';

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
      const result = resolveLocalizedValues(clone(mockBlock), 'en-US');
      expect(result.component?.options.text).toBe('Hello');
      expect(result.component?.options.nonLocalizedField).toBe(
        mockNonLocalizedValue
      );
    });

    it('should keep original values when no locale is provided', () => {
      const result = resolveLocalizedValues(clone(mockBlock), undefined);
      expect(result.component?.options.text).toEqual(mockLocalizedValue);
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
      const result = resolveLocalizedValues(clone(mockBlock), 'fr-FR');
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
  });
});
