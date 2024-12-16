import type { BuilderBlock } from '../types/builder-block.js';
import { traverse } from './traverse.js';

function isLocalizedField(value: any) {
  return (
    value &&
    typeof value === 'object' &&
    value['@type'] === '@builder.io/core:LocalizedValue'
  );
}

function containsLocalizedValues(data: Record<string, any>) {
  if (!data || !Object.getOwnPropertyNames(data).length) {
    return false;
  }
  let hasLocalizedValues = false;
  traverse(data, (value) => {
    if (isLocalizedField(value)) {
      hasLocalizedValues = true;
      return;
    }
  });
  return hasLocalizedValues;
}

function extractLocalizedValues(data: Record<string, any>, locale: string) {
  if (!data || !Object.getOwnPropertyNames(data).length) {
    return {};
  }

  traverse(data, (value, update) => {
    if (isLocalizedField(value)) {
      update(value[locale] ?? undefined);
    }
  });

  return data;
}

export function resolveLocalizedValues(
  block: BuilderBlock,
  locale: string | undefined
) {
  if (
    block.component?.options &&
    containsLocalizedValues(block.component?.options)
  ) {
    if (!locale) {
      console.warn(
        '[Builder.io] In order to use localized fields in Builder, you must pass a locale prop to the BuilderComponent or to options object while fetching the content to resolve localized fields. Learn more: https://www.builder.io/c/docs/localization-inline#targeting-and-inline-localization'
      );
    }
    block.component.options = extractLocalizedValues(
      block.component.options,
      locale ?? 'Default'
    );
  }

  return block;
}
