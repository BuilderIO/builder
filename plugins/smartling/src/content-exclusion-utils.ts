import { BuilderContent } from '@builder.io/sdk';
import traverse from 'traverse';
import get from 'lodash/get';

export interface ContentExclusionOptions {
  excludeHiddenContent?: boolean;
  excludedBlockTypes?: string[];
  customExclusionRules?: ExclusionRule[];
}

export interface ExclusionRule {
  id: string;
  name: string;
  type: 'content' | 'attribute' | 'block' | 'global';
  pattern: string | RegExp;
  scope: 'text' | 'all' | 'specific';
  enabled: boolean;
}

const localizedType = '@builder.io/core:LocalizedValue';

export type TranslateableFields = {
  [key: string]: {
    instructions?: string;
    value: string | Record<string, any>;
  };
};

/**
 * Check if an element is visually hidden based on various criteria
 */
function isElementHidden(element: any): boolean {
  if (!element) return false;

  // Check direct hide property (Builder's responsive hiding)
  if (element.hide) return true;

  // Check responsiveStyles for hiding
  if (element.responsiveStyles) {
    const hasHiddenStyle = Object.values(element.responsiveStyles).some((style: any) => {
      return style?.hide === true ||
             style?.display === 'none' ||
             style?.visibility === 'hidden' ||
             style?.opacity === '0' ||
             style?.opacity === 0;
    });
    if (hasHiddenStyle) return true;
  }

  // Check component options styles
  const styles = element.component?.options?.styles || {};
  if (styles.display === 'none' || 
      styles.visibility === 'hidden' || 
      styles.opacity === '0' || 
      styles.opacity === 0) {
    return true;
  }

  // Check inline styles in component options
  if (element.component?.options?.attributes?.style) {
    const inlineStyle = element.component.options.attributes.style;
    if (typeof inlineStyle === 'string') {
      if (inlineStyle.includes('display:none') ||
          inlineStyle.includes('display: none') ||
          inlineStyle.includes('visibility:hidden') ||
          inlineStyle.includes('visibility: hidden') ||
          inlineStyle.includes('opacity:0') ||
          inlineStyle.includes('opacity: 0')) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Check if a block type should be excluded
 */
function isBlockTypeExcluded(element: any, excludedBlockTypes: string[]): boolean {
  if (!element?.component?.name || !excludedBlockTypes.length) return false;
  return excludedBlockTypes.includes(element.component.name);
}

/**
 * Check if content matches custom exclusion rules
 */
function matchesExclusionRules(element: any, content: string, customRules: ExclusionRule[]): boolean {
  if (!customRules.length) return false;

  return customRules.some(rule => {
    if (!rule.enabled) return false;

    switch (rule.type) {
      case 'content':
        if (typeof rule.pattern === 'string') {
          return content.includes(rule.pattern);
        } else {
          return rule.pattern.test(content);
        }
      case 'block':
        return element?.component?.name === rule.pattern;
      case 'attribute':
        // Check if element has specific attributes
        const attrs = element?.component?.options?.attributes || {};
        return Object.keys(attrs).some(attr => {
          if (typeof rule.pattern === 'string') {
            return attr.includes(rule.pattern);
          } else {
            return rule.pattern.test(attr);
          }
        });
      default:
        return false;
    }
  });
}

function recordValue({
  results,
  value,
  path,
  instructions,
  sourceLocaleId,
}: {
  results: TranslateableFields;
  value: any;
  path: string;
  instructions: string;
  sourceLocaleId: string;
}) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      recordValue({
        results,
        value: item,
        path: `${path}[${index}]`,
        instructions,
        sourceLocaleId,
      });
    });
  } else if (typeof value === 'object') {
    if (value['@type'] === localizedType) {
      results[path] = {
        value: value?.[sourceLocaleId] || value?.Default,
        instructions,
      };
    } else {
      Object.entries(value).forEach(([key, v]) => {
        recordValue({
          results,
          value: v,
          path: `${path}.${key}`,
          instructions,
          sourceLocaleId,
        });
      });
    }
  }
}

/**
 * Enhanced version of getTranslateableFields with exclusion support
 */
export function getTranslateableFieldsWithExclusions(
  content: BuilderContent,
  sourceLocaleId: string,
  defaultInstructions: string,
  exclusionOptions: ContentExclusionOptions = {}
): TranslateableFields {
  const results: TranslateableFields = {};

  let { blocks, blocksString, state, ...customFields } = content.data!;

  // metadata [content's localized custom fields]
  traverse(customFields).forEach(function (el) {
    if (this.key && el && el['@type'] === localizedType) {
      results[`metadata.${this.path.join('#')}`] = {
        instructions: el.meta?.instructions || defaultInstructions,
        value: el[sourceLocaleId] || el.Default,
      };
    }
  });

  if (blocksString && typeof blocks === 'undefined') {
    blocks = JSON.parse(blocksString);
  }

  // blocks
  if (blocks) {
    traverse(blocks).forEach(function (el) {
      // Skip if element should be excluded
      if (exclusionOptions.excludeHiddenContent && isElementHidden(el)) {
        console.log(`Smartling: Excluding hidden element ${el?.id || 'unknown'}`);
        return;
      }

      if (exclusionOptions.excludedBlockTypes && 
          isBlockTypeExcluded(el, exclusionOptions.excludedBlockTypes)) {
        console.log(`Smartling: Excluding block type ${el?.component?.name} for element ${el?.id || 'unknown'}`);
        return;
      }

      // Handle localized text inputs
      if (this.key && el && el.meta?.localizedTextInputs) {
        const localizedTextInputs = el.meta.localizedTextInputs as string[];
        if (localizedTextInputs && Array.isArray(localizedTextInputs)) {
          localizedTextInputs
            .filter(input => get(el.component?.options || {}, `${input}.@type`) === localizedType)
            .forEach(inputKey => {
              const inputValue = get(el.component?.options || {}, inputKey);
              const valueToBeTranslated = inputValue?.[sourceLocaleId] || inputValue?.Default;
              
              if (valueToBeTranslated && 
                  !matchesExclusionRules(el, valueToBeTranslated, exclusionOptions.customExclusionRules || [])) {
                results[`blocks.${el.id}#${inputKey}`] = {
                  instructions: el.meta?.instructions || defaultInstructions,
                  value: valueToBeTranslated,
                };
              }
            });
        }
      }

      // Handle Text components
      if (el && el.id && el.component?.name === 'Text' && !el.meta?.excludeFromTranslation) {
        const componentText = el.component.options.text;
        const textValue = typeof componentText === 'string'
          ? componentText
          : componentText?.[sourceLocaleId] || componentText?.Default;

        if (textValue && 
            !matchesExclusionRules(el, textValue, exclusionOptions.customExclusionRules || [])) {
          results[`blocks.${el.id}#text`] = {
            value: textValue,
            instructions: el.meta?.instructions || defaultInstructions,
          };
        }
      }

      // Handle Symbol components
      if (el && el.id && el.component?.name === 'Symbol') {
        const symbolInputs = Object.entries(el.component?.options?.symbol?.data) || [];
        if (symbolInputs.length) {
          const basePath = `blocks.${el.id}.symbolInput`;
          symbolInputs.forEach(
            ([symbolInputName, symbolInputValue]: [
              symbolInputName: string,
              symbolInputValue: any,
            ]) => {
              if (symbolInputName === 'children') {
                return;
              }

              recordValue({
                results,
                value: symbolInputValue,
                path: `${basePath}#${symbolInputName}`,
                instructions: el.meta?.instructions || defaultInstructions,
                sourceLocaleId,
              });
            }
          );
        }
      }
    });
  }

  return results;
}

/**
 * Default block types that are commonly excluded from translation
 */
export const DEFAULT_EXCLUDED_BLOCK_TYPES = [
  'Image',
  'Video',
  'Code',
  'Embed',
  'Custom Code',
  'Form',
  'Button', // Often just action labels
  'Spacer',
  'Divider',
];

/**
 * Common exclusion rules for typical content patterns
 */
export const DEFAULT_EXCLUSION_RULES: ExclusionRule[] = [
  {
    id: 'email-addresses',
    name: 'Email Addresses',
    type: 'content',
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
    scope: 'text',
    enabled: true,
  },
  {
    id: 'phone-numbers',
    name: 'Phone Numbers',
    type: 'content',
    pattern: /(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/,
    scope: 'text',
    enabled: true,
  },
  {
    id: 'urls',
    name: 'URLs',
    type: 'content',
    pattern: /https?:\/\/[^\s]+/,
    scope: 'text',
    enabled: true,
  },
  {
    id: 'css-classes',
    name: 'CSS Classes',
    type: 'attribute',
    pattern: 'class',
    scope: 'all',
    enabled: true,
  },
];