import { BuilderContent } from '@builder.io/sdk';
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
    if (this.key && el && el['@type'] === localizedType) {
      const blockPath = [...this.path];
      const blockIndex = blockPath.shift();
      if (blockIndex) {
        const parsedBlockIndex = parseInt(blockIndex);
        const blockId = blocks![parsedBlockIndex].id;
        results[`blocks.${blockId}#${blockPath.join('#')}`] = {
          instructions: el.meta?.instructions || defaultInstructions,
          value: el[sourceLocaleId] || el.Default,
        };
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
        [locale]: translation[`metadata.${path}`].value,
      });
    }
  });

  traverse(blocks).forEach(function (el) {
    const blockPath = [...this.path];
    const blockIndex = blockPath.shift();
    if (blockIndex) {
      const parsedBlockIndex = parseInt(blockIndex);
      const blockId = blocks![parsedBlockIndex].id;
      const path = blockPath.join('#');
      if (translation[`blocks.${blockId}#${path}`]) {
        // TODO: Find a better way to extract the block node/context
        const blockNodeContext = this.parent?.parent?.parent;
        const blockNodeEl = blockNodeContext?.node;
        blockNodeContext?.update({
          ...blockNodeEl,
          meta: {
            ...blockNodeEl.meta,
            translated: true,
          },
          bindings: {
            ...blockNodeEl.bindings,
            [blockPath.join('.')]: `state.translation['blocks.${blockId}#${path}'][state.locale || 'Default']`,
          },
        });
      }
    }

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
