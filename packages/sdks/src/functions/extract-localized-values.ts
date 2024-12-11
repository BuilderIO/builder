import traverse from 'traverse';
import type { BuilderBlock } from '../types/builder-block.js';

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
  traverse(data).forEach(function (value) {
    if (isLocalizedField(value)) {
      hasLocalizedValues = true;
      this.stop();
    }
  });
  return hasLocalizedValues;
}

function extractLocalizedValues(data: Record<string, any>, locale: string) {
  if (!data || !Object.getOwnPropertyNames(data).length) {
    return {};
  }

  return traverse(data).map(function (value) {
    if (isLocalizedField(value)) {
      this.update(value[locale] ?? undefined);
    }
  });
}

export function resolveLocalizedValues(
  block: BuilderBlock,
  locale: string | undefined
) {
  if (
    block.component?.options &&
    containsLocalizedValues(block.component?.options) &&
    !locale
  ) {
    console.warn(
      '[Builder.io] In order to use localized fields in Builder, you must pass a locale prop to the BuilderComponent or to options object while fetching the content to resolve localized fields. Learn more: https://www.builder.io/c/docs/localization-inline#targeting-and-inline-localization'
    );
  }

  if (
    block.component?.options &&
    containsLocalizedValues(block.component?.options) &&
    locale
  ) {
    block.component.options = extractLocalizedValues(
      block.component.options,
      locale
    );
  }

  return block;
}
