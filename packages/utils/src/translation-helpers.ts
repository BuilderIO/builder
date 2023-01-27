import { BuilderContent } from '@builder.io/sdk';
import traverse from 'traverse';
import omit from 'lodash/omit';
import unescape from 'lodash/unescape';

export const localizedType = '@builder.io/core:LocalizedValue';
export const translatatedType = '@builder.io/core:TranslatedValue';

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

  if (typeof blocks === 'undefined') {
    blocks = JSON.parse(blocksString);
  }

  // metadata [content's localized custom fields]
  traverse(customFields).forEach(function (el) {
    if (this.key && el && el['@type'] === localizedType) {
      results[`metadata.${this.path.join('#')}`] = {
        instructions: el.meta?.instructions || defaultInstructions,
        value: el[sourceLocaleId] || el.Default,
      };
    }
  });

  // blocks
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

  return results;
}

export function applyTranslation(
  content: BuilderContent,
  translation: TranslateableFields,
  locale: string
) {
  let { blocks, blocksString, state, ...customFields } = content.data!;
  if (typeof blocks === 'undefined') {
    blocks = JSON.parse(blocksString);
  }

  traverse(customFields).forEach(function (el) {
    const path = this.path?.join('#');
    if (translation[`metadata.${path}`]) {
      this.update({
        ...el,
        [locale]: unescape(translation[`metadata.${path}`].value),
      });
    }
  });

  traverse(blocks).forEach(function (el) {
    if (
      el &&
      el.id &&
      el.component?.name === 'Text' &&
      !el.meta?.excludeFromTranslation &&
      translation[`blocks.${el.id}#text`]
    ) {
      this.update({
        ...el,
        meta: {
          ...el.meta,
          translated: true,
        },
        bindings: {
          ...el.bindings,
          'component.options.text': `state.translation['blocks.${el.id}#text'][state.locale || 'Default'] || \`${el.component.options.text}\``,
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

  const translationState = Object.keys(translation).reduce((acc, key) => {
    if (key.startsWith('blocks.')) {
      return {
        ...acc,
        [key]: {
          '@type': translatatedType,
          ...content.data!.state?.translation?.[key],
          [locale]: unescape(translation[key].value),
        },
      };
    }

    return acc;
  }, {});

  content.data!.state = {
    ...content.data!.state,
    translation: translationState,
  };

  content.data = {
    ...omit(content.data, 'blocksString'),
    blocks,
    ...customFields,
  };

  return content;
}
