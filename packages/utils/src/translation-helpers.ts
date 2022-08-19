import { BuilderContent, BuilderElement } from '@builder.io/sdk';
import traverse from 'traverse';
import omit from 'lodash/omit';
const localizedType = '@builder.io/core:LocalizedValue';

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
    // TODO: localized custom components inputs
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
        [locale]: translation[`metadata.${path}`].value,
      });
    }
  });

  traverse(blocks).forEach(function (el) {
    // TODO: localized custom components inputs
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
  });

  const translationState = Object.keys(translation).reduce((acc, key) => {
    if (key.startsWith('blocks.')) {
      return {
        ...acc,
        [key]: {
          '@type': localizedType,
          ...content.data!.state?.translation?.[key],
          [locale]: translation[key].value,
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
