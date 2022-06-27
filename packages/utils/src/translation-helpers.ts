import { BuilderContent, BuilderElement } from '@builder.io/sdk';
import traverse from 'traverse';
import omit from 'lodash/omit';
const localizedType = '@builder.io/core:LocalizedValue';

export type TranslateableFields = {
  metadata: Record<string, string>;
  blocks: Record<string, string>;
};

export function getTranslateableFields(content: BuilderContent, sourceLocaleId: string) {
  const results: TranslateableFields = { blocks: {}, metadata: {} };

  let { blocks, blocksString, state, ...customFields } = content.data!;

  if (typeof blocks === 'undefined') {
    blocks = JSON.parse(blocksString);
  }

  // metadata [content's localized custom fields]
  traverse(customFields).forEach(function (el) {
    if (this.key && el && el['@type'] === localizedType) {
      results.metadata[this.key] = el[sourceLocaleId] || el.Default;
    }
  });

  // blocks
  traverse(blocks).forEach(function (el) {
    // TODO: localized custom components inputs
    if (el && el.id && el.component?.name === 'Text' && !el.meta?.excludeFromTranslation) {
      results.blocks[`${el.id}#text`] = el.component.options.text;
    }
  });

  return results;
}

export function appLyTranslation(
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
    if (translation.metadata[path]) {
      this.update({
        ...el,
        [locale]: translation.metadata[path],
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
      translation.blocks[`${el.id}#text`]
    ) {
      this.update({
        ...el,
        meta: {
          ...el.meta,
          translated: true,
        },
        bindings: {
          ...el.bindings,
          'component.options.text': `state.translation['${el.id}#text'][state.locale || 'Default'] || \`${el.component.options.text}\``,
        },
      });
    }
  });

  const translationState = Object.keys(translation.blocks).reduce((acc, key) => {
    return {
      ...acc,
      [key]: {
        '@type': localizedType,
        ...content.data!.state?.translation?.[key],
        [locale]: translation.blocks[key],
      },
    };
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
