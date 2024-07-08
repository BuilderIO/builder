import { BuilderContent } from '@builder.io/sdk';
import traverse from 'traverse';
import omit from 'lodash/omit';
import unescape from 'lodash/unescape';
import set from 'lodash/set';

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
  } else if (typeof value === 'object') {
    if (value['@type'] === localizedType) {
      const translatedSymbolInput = translation[`${basePath}${path}`];

      if (!translatedSymbolInput?.value) {
        return;
      }

      set(data, path, {
        ...value,
        [locale]: unescapeStringOrObject(translatedSymbolInput.value),
      });

      transformedMeta[`transformed.symbol.data.${path}`] = 'localized';
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
      if (this.key && el && el.meta?.localizedTextInputs) {
        const localizedTextInputs = el.meta.localizedTextInputs as string[];
        if (localizedTextInputs && Array.isArray(localizedTextInputs)) {
          localizedTextInputs
            .filter(input => el.component?.options?.[input]?.['@type'] === localizedType)
            .forEach(inputKey => {
              const valueToBeTranslated =
                el.component.options?.[inputKey]?.[sourceLocaleId] ||
                el.component.options?.[inputKey]?.Default;
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
              symbolInputValue: any
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
      if (el && el.id && el.component?.name === 'Symbol') {
        const symbolInputs = Object.entries(el.component?.options?.symbol?.data) || [];
        if (symbolInputs.length) {
          const transformedMeta = {};

          symbolInputs.forEach(
            ([symbolInputName, symbolInputValue]: [
              symbolInputName: string,
              symbolInputValue: any
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
            options = {
              ...options,
              [key]: {
                ...el.component.options[key],
                [locale]: unescapeStringOrObject(translation[`blocks.${el.id}#${key}`].value),
              },
            };
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
