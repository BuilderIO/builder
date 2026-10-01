import type { BuilderBlock } from '../types/builder-block.js';

function isLocalizedField(value: any) {
  return (
    value &&
    typeof value === 'object' &&
    value['@type'] === '@builder.io/core:LocalizedValue'
  );
}

const isPlainObjectOrArray = (value: object) => {
  if (Array.isArray(value)) return true;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
};

/**
 * Returns `value` with every localized value replaced by its `locale` entry.
 * Only the objects and arrays on the way to a replaced value are copied: the
 * input is never mutated, and a value with nothing localized is returned as-is.
 */
function resolveLocalized(
  value: any,
  locale: string,
  seen: WeakMap<object, any>
): any {
  if (value === null || typeof value !== 'object') return value;
  if (isLocalizedField(value)) {
    return resolveLocalized(value[locale] ?? undefined, locale, seen);
  }
  if (!isPlainObjectOrArray(value)) return value;
  if (seen.has(value)) return seen.get(value);
  seen.set(value, value);

  let copy: any = null;
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      const next = resolveLocalized(value[i], locale, seen);
      if (next !== value[i]) {
        if (!copy) copy = value.slice();
        copy[i] = next;
      }
    }
  } else {
    for (const key of Object.keys(value)) {
      const next = resolveLocalized(value[key], locale, seen);
      if (next !== value[key]) {
        if (!copy) copy = { ...value };
        copy[key] = next;
      }
    }
  }

  const result = copy ?? value;
  seen.set(value, result);
  return result;
}

/**
 * Returns the block with localized values in `component.options` resolved.
 * The block is returned unchanged (same object) when it has none.
 */
export function resolveLocalizedValues(
  block: BuilderBlock,
  locale: string | undefined
) {
  const options = block.component?.options;
  if (!options || typeof options !== 'object' || isLocalizedField(options)) {
    return block;
  }

  const resolvedOptions = resolveLocalized(
    options,
    locale ?? 'Default',
    new WeakMap()
  );
  if (resolvedOptions === options) {
    return block;
  }

  if (!locale) {
    console.warn(
      '[Builder.io] In order to use localized fields in Builder, you must pass a locale prop to the BuilderComponent or to options object while fetching the content to resolve localized fields. Learn more: https://www.builder.io/c/docs/localization-inline#targeting-and-inline-localization'
    );
  }

  return {
    ...block,
    component: { ...block.component!, options: resolvedOptions },
  };
}
