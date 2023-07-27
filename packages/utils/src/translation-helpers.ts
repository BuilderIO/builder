import { BuilderContent } from '@builder.io/sdk';
import traverse from 'traverse';
import omit from 'lodash/omit';
import unescape from 'lodash/unescape';

export const localizedType = '@builder.io/core:LocalizedValue';

export type TranslateableFields = {
  [key: string]: {
    instructions?: string;
    value: string;
  };
};

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
        results[`blocks.${el.id}#text`] = {
          value: el.component.options.text,
          instructions: el.meta?.instructions || defaultInstructions,
        };
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
        [locale]: unescape(translation[`metadata.${path}`].value),
      });
    }
  });

  if (blocksString && typeof blocks === 'undefined') {
    blocks = JSON.parse(blocksString);
  }

  if (blocks) {
    traverse(blocks).forEach(function (el) {
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
          options: {
            ...el.component.options,
            text: {
              '@type': localizedType,
              ...localizedValues,
              [locale]: unescape(translation[`blocks.${el.id}#text`].value),
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
                [locale]: unescape(translation[`blocks.${el.id}#${key}`].value),
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
