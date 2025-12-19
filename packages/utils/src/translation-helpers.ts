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

      // If the extracted value is a string, store it directly
      if (typeof extractedValue === 'string') {
        results[path] = {
          value: extractedValue,
          instructions,
        };
      } else if (
        Array.isArray(extractedValue) ||
        (typeof extractedValue === 'object' && extractedValue !== null)
      ) {
        // If the extracted value is an array or object, recurse into it to find more localized values
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
  translationPath,
  dataPath,
  value,
  translation,
  transformedMeta,
  locale,
}: {
  data: any;
  basePath: string;
  translationPath: string; // Path used for looking up translations
  dataPath: string; // Actual path in the data structure for setting values
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
        translationPath: `${translationPath}[${index}]`,
        dataPath: `${dataPath}[${index}]`,
        value: item,
        translation,
        transformedMeta,
        locale,
      });
    });
  } else if (typeof value === 'object' && value !== null) {
    if (value['@type'] === localizedType) {
      const translatedSymbolInput = translation[`${basePath}${translationPath}`];

      if (translatedSymbolInput?.value) {
        // Direct translation found for this path - apply it
        set(data, dataPath, {
          ...value,
          [locale]: unescapeStringOrObject(translatedSymbolInput.value),
        });

        transformedMeta[`transformed.symbol.data.${translationPath}`] = 'localized';
      } else {
        // No direct translation - check if Default value contains nested LocalizedValues
        const defaultValue = value?.Default;
        if (
          Array.isArray(defaultValue) ||
          (typeof defaultValue === 'object' && defaultValue !== null)
        ) {
          // Recurse into the Default array/object to find nested LocalizedValues
          // The dataPath must include '.Default' to correctly point to where values should be set
          resolveTranslation({
            data,
            basePath,
            translationPath, // Keep same translation path for lookup
            dataPath: `${dataPath}.Default`, // But update data path to include the locale key
            value: defaultValue,
            translation,
            transformedMeta,
            locale,
          });
        }

        // Also check if there's a locale-specific array/object and apply translations there too
        const localeValue = value?.[locale];
        if (
          localeValue &&
          (Array.isArray(localeValue) || (typeof localeValue === 'object' && localeValue !== null))
        ) {
          // Recurse into the locale-specific array/object to find nested LocalizedValues
          resolveTranslation({
            data,
            basePath,
            translationPath, // Keep same translation path for lookup
            dataPath: `${dataPath}.${locale}`, // Update data path to point to locale-specific branch
            value: localeValue,
            translation,
            transformedMeta,
            locale,
          });
        }
      }
    } else {
      Object.entries(value).forEach(([key, v]) => {
        resolveTranslation({
          data,
          basePath,
          translationPath: `${translationPath}.${key}`,
          dataPath: `${dataPath}.${key}`,
          value: v,
          translation,
          transformedMeta,
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
      if (this.key && el && el.meta?.localizedTextInputs && !el.meta?.excludeFromTranslation) {
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

      if (el && el.id && el.component?.name === 'Core:Button' && !el.meta?.excludeFromTranslation) {
        const componentText = el.component.options?.text;
        if (componentText) {
          const textValue = typeof componentText === 'string'
            ? componentText
            : componentText?.[sourceLocaleId] || componentText?.Default;
          if (textValue) {
            results[`blocks.${el.id}#text`] = {
              value: textValue,
              instructions: el.meta?.instructions || defaultInstructions,
            };
          }
        }
      }

      if (el && el.id && el.component?.name === 'Symbol'&& !el.meta?.excludeFromTranslation) {
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

  traverse(customFields).forEach(function (el) {
    const path = this.path?.join('#');
    if (translation[`metadata.${path}`]) {
      this.update({
        ...el,
        [locale]: unescapeStringOrObject(translation[`metadata.${path}`].value),
      });
    }
  });

  if (blocksString && typeof blocks === 'undefined') {
    blocks = JSON.parse(blocksString);
  }

  if (blocks) {
    traverse(blocks).forEach(function (el) {
      if (el && el.id && el.component?.name === 'Symbol' && !el.meta?.excludeFromTranslation) {
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
                translationPath: symbolInputName,
                dataPath: symbolInputName,
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

      // Core:Button special handling - similar to Text component
      if (
        el &&
        el.id &&
        el.component?.name === 'Core:Button' &&
        !el.meta?.excludeFromTranslation &&
        translation[`blocks.${el.id}#text`]
      ) {
        const localizedValues =
          typeof el.component.options?.text === 'string'
            ? {
                Default: el.component.options.text,
              }
            : el.component.options.text;

        const updatedElement = {
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
        };
        
        this.update(updatedElement);
      }

      // custom components
      if (el && el.id && el.meta?.localizedTextInputs && !el.meta?.excludeFromTranslation) {
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
