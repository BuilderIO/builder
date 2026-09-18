import type { BuilderBlock } from '../types/builder-block.js';

const LOCALIZED_TYPE = '@builder.io/core:LocalizedValue';

function resolveChild(child: any, locale: string, state: { seen: boolean }): any {
  if (child === null || typeof child !== 'object') {
    return child;
  }
  if (child['@type'] === LOCALIZED_TYPE) {
    state.seen = true;
    const value = child[locale] ?? undefined;
    if (value !== null && typeof value === 'object') {
      resolveLocalized(value, locale, state);
    }
    return value;
  }
  resolveLocalized(child, locale, state);
  return child;
}

// Resolve every LocalizedValue under `node` to `locale`, in place, in a single pass.
function resolveLocalized(
  node: any,
  locale: string,
  state: { seen: boolean }
): void {
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) {
      node[i] = resolveChild(node[i], locale, state);
    }
  } else {
    for (const key in node) {
      node[key] = resolveChild(node[key], locale, state);
    }
  }
}

export function resolveLocalizedValues(
  block: BuilderBlock,
  locale: string | undefined
) {
  const options = block.component?.options;
  if (!options || typeof options !== 'object') {
    return block;
  }

  const state = { seen: false };
  resolveLocalized(options, locale ?? 'Default', state);

  if (state.seen && !locale) {
    console.warn(
      '[Builder.io] In order to use localized fields in Builder, you must pass a locale prop to the BuilderComponent or to options object while fetching the content to resolve localized fields. Learn more: https://www.builder.io/c/docs/localization-inline#targeting-and-inline-localization'
    );
  }

  return block;
}
