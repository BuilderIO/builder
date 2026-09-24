import { isBrowser } from '../functions/is-browser.js';
import type { UserAttributes } from './user-attributes.js';

const STUDIO_PREVIEW_PARAM = 'builder.preview';
const STUDIO_PREVIEW_VALUE = 'BUILDER_STUDIO';
const USER_ATTRIBUTE_PARAM_PREFIX = 'builder.userAttributes.';

const parseStudioValue = (value: string) => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
};

/**
 * Studio passes its targeting overrides as query params because it cannot write the
 * builder.userAttributes cookie on the previewed site's origin.
 */
export const getStudioUserAttributes = (): UserAttributes => {
  if (!isBrowser()) {
    return {};
  }

  const params = new URLSearchParams(window.location.search);

  if (params.get(STUDIO_PREVIEW_PARAM) !== STUDIO_PREVIEW_VALUE) {
    return {};
  }

  const attributes: UserAttributes = {};
  params.forEach((value, key) => {
    if (key.startsWith(USER_ATTRIBUTE_PARAM_PREFIX)) {
      attributes[key.slice(USER_ATTRIBUTE_PARAM_PREFIX.length)] =
        parseStudioValue(value);
    }
  });

  return attributes;
};
