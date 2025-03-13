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

  // Get the parent div containing this script
  // const parentDiv = document.currentScript?.parentElement;
  const blocksStyle = document.currentScript?.previousElementSibling;
  const blocksDiv = blocksStyle?.previousElementSibling;
  const variantId = blocksDiv?.getAttribute('data-variant-id');

  let isDefaultVariant = false;
  if (!variantId) {
    isDefaultVariant = true;
  }

  const isWinningVariant =
    winningVariantIndex !== -1 &&
    variantId === `${blockId}-${winningVariantIndex}`;

  // Show/hide variants based on winning status
  if (isWinningVariant && !isDefaultVariant) {
    blocksDiv?.removeAttribute('hidden');
    blocksDiv?.removeAttribute('aria-hidden');
    blocksDiv?.removeAttribute('data-variant-id');
  } else if (!isWinningVariant && isDefaultVariant) {
    blocksDiv?.setAttribute('hidden', 'true');
    blocksDiv?.setAttribute('aria-hidden', 'true');
  }

  // For hydration frameworks, remove non-winning variants and the script tag
  if (isHydrationTarget) {
    if (!isWinningVariant) {
      blocksDiv?.remove();
      blocksStyle?.remove();
    }
    const thisScript = document.currentScript;
    if (thisScript) {
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

export const PERSONALIZATION_SCRIPT = getPersonalizedVariant.toString();
export const FILTER_WITH_CUSTOM_TARGETING_SCRIPT =
  filterWithCustomTargeting.toString();
