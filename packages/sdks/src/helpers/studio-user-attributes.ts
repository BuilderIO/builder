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
 * Builder's Studio tab passes its "Preview as" targeting overrides (date, device, custom
 * attributes) as URL query params. It has no way to write the `builder.userAttributes`
 * cookie on the previewed site's domain, so they must be read from the URL instead.
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
