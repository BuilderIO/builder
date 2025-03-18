/**
 * WARNING: This file contains functions that get stringified and inlined into the HTML at build-time.
 * They cannot import anything.
 */

import type { Query, UserAttributes } from '../helpers.js';
import { type PersonalizationContainerProps } from '../personalization-container.types.js';

function getPersonalizedVariant(
  variants: PersonalizationContainerProps['variants'],
  blockId: string,
  isHydrationTarget: boolean,
  locale?: string
) {
  if (!navigator.cookieEnabled) {
    return;
  }
  console.log('calling getPersonalizedVariant');

  function getCookie(name: string) {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  const attributes = JSON.parse(getCookie('builder.userAttributes') || '{}');
  if (locale) {
    attributes.locale = locale;
  }

  const winningVariantIndex = variants?.findIndex(function (variant) {
    return (window as any).filterWithCustomTargeting(
      attributes,
      variant.query,
      variant.startDate,
      variant.endDate
    );
  });

  const parentDiv = document.currentScript?.parentElement;
  const variantId = parentDiv?.getAttribute('data-variant-id');
  console.log('variantId', variantId, {
    parentDiv: parentDiv?.outerHTML,
  });

  const isDefaultVariant = variantId === `${blockId}-default`;
  console.log('isDefaultVariant', isDefaultVariant);
  const isWinningVariant =
    (winningVariantIndex !== -1 &&
      variantId === `${blockId}-${winningVariantIndex}`) ||
    (winningVariantIndex === -1 && isDefaultVariant);

  console.log('isWinningVariant', isWinningVariant);

  // Show/hide variants based on winning status
  if (isWinningVariant && !isDefaultVariant) {
    parentDiv?.removeAttribute('hidden');
    parentDiv?.removeAttribute('aria-hidden');
    console.log('removing hidden attribute', {
      parentDiv: parentDiv?.outerHTML,
    });
  } else if (!isWinningVariant && isDefaultVariant) {
    parentDiv?.setAttribute('hidden', 'true');
    parentDiv?.setAttribute('aria-hidden', 'true');
    console.log('setting hidden attribute', {
      parentDiv: parentDiv?.outerHTML,
    });
  }

  // For hydration frameworks, remove non-winning variants and the script tag
  if (isHydrationTarget) {
    if (!isWinningVariant) {
      console.log('removing parentDiv');
      parentDiv?.remove();
    }
    const thisScript = document.currentScript;
    if (thisScript) {
      console.log('removing thisScript');
      thisScript.remove();
    }
  }
}

export function filterWithCustomTargeting(
  userAttributes: UserAttributes,
  query: Query[],
  startDate?: string,
  endDate?: string
) {
  function isString(val: unknown): val is string {
    return typeof val === 'string';
  }

  function isNumber(val: unknown): val is number {
    return typeof val === 'number';
  }

  function objectMatchesQuery(userattr: UserAttributes, query: Query): boolean {
    const result = (() => {
      const property = query.property;
      const operator = query.operator;
      let testValue = query.value;

      if (
        query &&
        query.property === 'urlPath' &&
        query.value &&
        typeof query.value === 'string' &&
        query.value !== '/' &&
        query.value.endsWith('/')
      ) {
        testValue = query.value.slice(0, -1);
      }

      if (!(property && operator)) {
        return true;
      }

      if (Array.isArray(testValue)) {
        if (operator === 'isNot') {
          return testValue.every((val) =>
            objectMatchesQuery(userattr, { property, operator, value: val })
          );
        }
        return !!testValue.find((val) =>
          objectMatchesQuery(userattr, { property, operator, value: val })
        );
      }
      const value = userattr[property];

      if (Array.isArray(value)) {
        return value.includes(testValue);
      }

      switch (operator) {
        case 'is':
          return value === testValue;
        case 'isNot':
          return value !== testValue;
        case 'contains':
          return (
            (isString(value) || Array.isArray(value)) &&
            value.includes(String(testValue))
          );
        case 'startsWith':
          return isString(value) && value.startsWith(String(testValue));
        case 'endsWith':
          return isString(value) && value.endsWith(String(testValue));
        case 'greaterThan':
          return isNumber(value) && isNumber(testValue) && value > testValue;
        case 'lessThan':
          return isNumber(value) && isNumber(testValue) && value < testValue;
        case 'greaterThanOrEqualTo':
          return isNumber(value) && isNumber(testValue) && value >= testValue;
        case 'lessThanOrEqualTo':
          return isNumber(value) && isNumber(testValue) && value <= testValue;
        default:
          return false;
      }
    })();

    return result;
  }
  const item = {
    query,
    startDate,
    endDate,
  };

  const now =
    (userAttributes.date && new Date(userAttributes.date)) || new Date();

  if (item.startDate && new Date(item.startDate) > now) {
    return false;
  } else if (item.endDate && new Date(item.endDate) < now) {
    return false;
  }

  if (!item.query || !item.query.length) {
    return true;
  }

  return item.query.every((filter: Query) => {
    return objectMatchesQuery(userAttributes, filter);
  });
}

export function updateVisibilityStylesScript(
  variants: PersonalizationContainerProps['variants'],
  blockId: string,
  isHydrationTarget: boolean,
  locale?: string
) {
  function getCookie(name: string) {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }
  const visibilityStylesEl = document.querySelector(
    `[data-id="variants-styles-${blockId}"]`
  );

  if (!visibilityStylesEl) {
    return;
  }

  if (isHydrationTarget) {
    visibilityStylesEl.remove();
    const currentScript = document.currentScript;
    if (currentScript) {
      currentScript.remove();
    }
  } else {
    const attributes = JSON.parse(getCookie('builder.userAttributes') || '{}');
    if (locale) {
      attributes.locale = locale;
    }
    const winningVariantIndex = variants?.findIndex(function (variant) {
      return (window as any).filterWithCustomTargeting(
        attributes,
        variant.query,
        variant.startDate,
        variant.endDate
      );
    });
    console.log('winningVariantIndex', winningVariantIndex);
    if (winningVariantIndex !== -1) {
      let newStyleStr =
        variants
          ?.filter((_, index) => index !== winningVariantIndex)
          ?.map((_, index) => {
            return `div[data-variant-id="${blockId}-${index}"] { display: none !important; } `;
          })
          .join('') || '';
      newStyleStr += `div[data-variant-id="${blockId}-default"] { display: none !important; } `;
      visibilityStylesEl.innerHTML = newStyleStr;
      console.log('newStyleStr', { newStyleStr });
    }
  }
}

export const PERSONALIZATION_SCRIPT = getPersonalizedVariant.toString();
export const FILTER_WITH_CUSTOM_TARGETING_SCRIPT =
  filterWithCustomTargeting.toString();
export const UPDATE_VISIBILITY_STYLES_SCRIPT =
  updateVisibilityStylesScript.toString();
