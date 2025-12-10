import { BuilderContent } from '@builder.io/sdk';
import traverse from 'traverse';
import omit from 'lodash/omit';
import unescape from 'lodash/unescape';
import set from 'lodash/set';
import get from 'lodash/get';

export const localizedType = '@builder.io/core:LocalizedValue';

export type TranslateableFields = {
  [key: string]: {
    instructions?: string;
    value: string | Record<string, any>;
  };
};

function unescapeStringOrObject(input: string | Record<string, any>) {
  // Check if input is a string
  if (typeof input === 'string') {
    return unescape(input);
  }

  // Check if input is an object
  if (typeof input === 'object' && input !== null) {
    Object.keys(input).forEach(key => {
      if (typeof input[key] === 'string') {
        input[key] = unescape(input[key]);
      }
    });
    return input;
  }

  // Return input as is if it's neither a string nor an object
  return input;
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
  } else if (typeof value === 'object' && value !== null) {
    if (value['@type'] === localizedType) {
      const extractedValue = value?.[sourceLocaleId] || value?.Default;
      
      // Only record if it's a string - these are the actual translatable values
      if (typeof extractedValue === 'string') {
        results[path] = {
          value: extractedValue,
          instructions,
        };
      } else if (Array.isArray(extractedValue) || (typeof extractedValue === 'object' && extractedValue !== null)) {
        // If extracted value is array/object, recursively process for nested LocalizedValues
        recordValue({
          results,
          value: extractedValue,
          path,
          instructions,
          sourceLocaleId,
        });
      }
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

function resolveTranslation({
  data,
  basePath,
  path,
  value,
  translation,
  transformedMeta,
  locale,
}: {
  data: any;
  basePath: string;
  path: string;
  value: any;
  translation: any;
  transformedMeta: Record<string, string>;
  locale: string;
}) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      resolveTranslation({
        data,
        basePath,
        path: `${path}[${index}]`,
        value: item,
        translation,
        transformedMeta,
        locale,
      });
    });
  } else if (typeof value === 'object' && value !== null) {
    if (value['@type'] === localizedType) {
      const translatedSymbolInput = translation[`${basePath}${path}`];

      if (translatedSymbolInput?.value) {
        // Directly mutate the LocalizedValue object to add the translated locale
        value[locale] = unescapeStringOrObject(translatedSymbolInput.value);
        transformedMeta[`transformed.symbol.data.${path}`] = 'localized';
      }
      
      // Also check for nested LocalizedValues within the extracted value
      const extractedValue = value?.Default;
      if (Array.isArray(extractedValue) || (typeof extractedValue === 'object' && extractedValue !== null)) {
        resolveTranslation({
          data,
          basePath,
          path,
          value: extractedValue,
          translation,
          transformedMeta,
          locale,
        });
      }
    } else {
      Object.entries(value).forEach(([key, v]) => {
        resolveTranslation({
          data,
          basePath,
          path: `${path}.${key}`,
          value: v,
          translation,
          transformedMeta,
          locale,
        });
      });
    }
  }
}

// Helper function to resolve translations for metadata with nested LocalizedValues
// This function directly mutates the LocalizedValue objects it finds
function resolveMetadataTranslation({
  basePath,
  path,
  value,
  translation,
  locale,
}: {
  basePath: string;
  path: string;
  value: any;
  translation: any;
  locale: string;
}) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      resolveMetadataTranslation({
        basePath,
        path: `${path}[${index}]`,
        value: item,
        translation,
        locale,
      });
    });
  } else if (typeof value === 'object' && value !== null) {
    if (value['@type'] === localizedType) {
      const translatedValue = translation[`${basePath}${path}`];

      if (translatedValue?.value) {
        // Directly mutate the LocalizedValue object to add the translated locale
        value[locale] = unescapeStringOrObject(translatedValue.value);
      }
      
      // Also check for nested LocalizedValues within the extracted value
      const extractedValue = value?.Default;
      if (Array.isArray(extractedValue) || (typeof extractedValue === 'object' && extractedValue !== null)) {
        resolveMetadataTranslation({
          basePath,
          path,
          value: extractedValue,
          translation,
          locale,
        });
      }
    } else {
      Object.entries(value).forEach(([key, v]) => {
        resolveMetadataTranslation({
          basePath,
          path: `${path}.${key}`,
          value: v,
          translation,
          locale,
        });
      });
    }
  }
}

export function getTranslateableFields(
  content: BuilderContent,
  sourceLocaleId: string,
  defaultInstructions: string
) {
  const results: TranslateableFields = {};

  let { blocks, blocksString, state, ...customFields } = content.data!;

  // metadata [content's localized custom fields]
  traverse(customFields).forEach(function (el) {
    if (this.key && el && el['@type'] === localizedType) {
      const extractedValue = el[sourceLocaleId] || el.Default;
      
      // Only record if it's a string - these are the actual translatable values
      if (typeof extractedValue === 'string') {
        results[`metadata.${this.path.join('#')}`] = {
          instructions: el.meta?.instructions || defaultInstructions,
          value: extractedValue,
        };
      } else if (Array.isArray(extractedValue) || (typeof extractedValue === 'object' && extractedValue !== null)) {
        // If extracted value is array/object, recursively process for nested LocalizedValues
        recordValue({
          results,
          value: extractedValue,
          path: `metadata.${this.path.join('#')}`,
          instructions: el.meta?.instructions || defaultInstructions,
          sourceLocaleId,
        });
      }
      
      // Stop traversing into this LocalizedValue's locale-specific keys
      // to avoid processing fr-FR, de-DE, etc. arrays separately
      this.block();
    }
  });

  if (blocksString && typeof blocks === 'undefined') {
    blocks = JSON.parse(blocksString);
  }

  // blocks
  if (blocks) {
    traverse(blocks).forEach(function (el) {
      if (this.key && el && el.meta?.localizedTextInputs) {
        const localizedTextInputs = el.meta.localizedTextInputs as string[];
        if (localizedTextInputs && Array.isArray(localizedTextInputs)) {
          localizedTextInputs
            .filter(input => get(el.component?.options || {}, `${input}.@type`) === localizedType)
            .forEach(inputKey => {
              const inputValue = get(el.component?.options || {}, inputKey);
              const valueToBeTranslated = inputValue?.[sourceLocaleId] || inputValue?.Default;
              if (valueToBeTranslated) {
                results[`blocks.${el.id}#${inputKey}`] = {
                  instructions: el.meta?.instructions || defaultInstructions,
                  value: valueToBeTranslated,
                };
              }
            });
        }
      }
      if (el && el.id && el.component?.name === 'Text' && !el.meta?.excludeFromTranslation) {
        const componentText = el.component.options.text;
        results[`blocks.${el.id}#text`] = {
          value:
            typeof componentText === 'string'
              ? componentText
              : componentText?.[sourceLocaleId] || componentText?.Default,
          instructions: el.meta?.instructions || defaultInstructions,
        };
      }

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

export function applyTranslation(
  content: BuilderContent,
  translation: TranslateableFields,
  locale: string
) {
  let { blocks, blocksString, state, ...customFields } = content.data!;

  // Handle simple LocalizedValue fields (backward compatible)
  traverse(customFields).forEach(function (el) {
    const path = this.path?.join('#');
    if (translation[`metadata.${path}`]) {
      this.update({
        ...el,
        [locale]: unescapeStringOrObject(translation[`metadata.${path}`].value),
      });
    }
    
    // For LocalizedValues containing arrays/objects with nested LocalizedValues,
    // use the resolveMetadataTranslation helper
    if (this.key && el && el['@type'] === localizedType) {
      const extractedValue = el?.Default;
      if (Array.isArray(extractedValue) || (typeof extractedValue === 'object' && extractedValue !== null)) {
        resolveMetadataTranslation({
          basePath: 'metadata.',
          path: this.path?.join('#') || '',
          value: extractedValue,
          translation,
          locale,
        });
      }
      // Stop traversing into locale-specific keys
      this.block();
    }
  });

  if (blocksString && typeof blocks === 'undefined') {
    blocks = JSON.parse(blocksString);
  }

  if (blocks) {
    traverse(blocks).forEach(function (el) {
      if (el && el.id && el.component?.name === 'Symbol') {
        const symbolInputs = Object.entries(el.component?.options?.symbol?.data) || [];
        if (symbolInputs.length) {
          const transformedMeta = {};

          symbolInputs.forEach(
            ([symbolInputName, symbolInputValue]: [
              symbolInputName: string,
              symbolInputValue: any,
            ]) => {
              resolveTranslation({
                data: el.component?.options?.symbol?.data,
                basePath: `blocks.${el.id}.symbolInput#`,
                path: symbolInputName,
                value: symbolInputValue,
                translation,
                transformedMeta,
                locale,
              });

              this.update({
                ...el,
                meta: {
                  ...el.meta,
                  translated: true,
                  // this tells the editor that this is a forced localized input similar to clicking the globe icon
                  ...transformedMeta,
                },
                component: {
                  ...el.component,
                  options: {
                    ...(el.component.options || {}),
                    symbol: {
                      ...(el.component.options.symbol || {}),
                      data: {
                        ...(el.component.options.symbol?.data || {}),
                      },
                    },
                  },
                },
              });
            }
          );
        }
      }

      if (
        el &&
        el.id &&
        el.component?.name === 'Text' &&
        !el.meta?.excludeFromTranslation &&
        translation[`blocks.${el.id}#text`]
      ) {
        const localizedValues =
          typeof el.component.options?.text === 'string'
            ? {
                Default: el.component.options.text,
              }
            : el.component.options.text;

        this.update({
          ...el,
          meta: {
            ...el.meta,
            translated: true,
            // this tells the editor that this is a forced localized input similar to clicking the globe icon
            'transformed.text': 'localized',
          },
          component: {
            ...el.component,
            options: {
              ...el.component.options,
              text: {
                '@type': localizedType,
                ...localizedValues,
                [locale]: unescapeStringOrObject(translation[`blocks.${el.id}#text`].value),
              },
            },
          },
        });
      }

      // custom components
      if (el && el.id && el.meta?.localizedTextInputs) {
        // there's a localized input
        const keys = el.meta?.localizedTextInputs as string[];
        let options = el.component.options;

        keys.forEach(key => {
          if (translation[`blocks.${el.id}#${key}`]) {
            set(options, key, {
              ...(get(options, key) || {}),
              [locale]: unescapeStringOrObject(translation[`blocks.${el.id}#${key}`].value),
            });

            this.update({
              ...el,
              meta: {
                ...el.meta,
                translated: true,
              },
              component: {
                ...el.component,
                options,
              },
            });
          }
        });
      }
    });
    content.data = {
      ...omit(content.data, 'blocksString'),
      blocks,
    };
  }

  content.data = {
    ...content.data,
    ...customFields,
  };

  return content;
}
