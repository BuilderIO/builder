import type { NextRequest } from 'next/server';
import { PersonalizedURL, PersonalizedURLOptions } from './personalized-url';
import { getUserAttributes } from './utils';

const tryJsonParse = (val: string) => {
  let result = val;
  try {
    result = JSON.parse(val);
  } catch {
    result = val;
  }
  return result;
};

export function getPersonalizedURL(
  request: NextRequest,
  options: {
    attributes?: Record<string, string>;
    urlConfig?: Partial<PersonalizedURLOptions>;
    cookiesPrefix?: string;
  } = {}
) {
  const url = new URL(request.nextUrl);
  const query = Object.fromEntries(url.searchParams);
  const allCookies: Record<string, any> = {};
  for (const cookie of request.cookies) {
    const key = cookie[0];
    const value = request.cookies.get(key)?.value;
    if (value) {
      const parsedCookie = tryJsonParse(value);
      allCookies[key] = parsedCookie;
    }
  }

  const builderAttrs = getUserAttributes({ ...allCookies, ...query });
  const personalizedURL = new PersonalizedURL({
    pathname: url.pathname,
    // Buffer is not available in middleware environment as of next 12.2 , overriding with btoa
    encode: url => {
      return btoa(url);
    },
    attributes: {
      ...options.attributes,
      ...getUserAttributes({ ...allCookies, ...query }, options.cookiesPrefix),
      ...builderAttrs,
    },
    ...{
      prefix: request.nextUrl.pathname,
      ...options.urlConfig,
    },
  });
  url.pathname = personalizedURL.rewritePath();
  return url;
}

export function getUserAttributesFromHash(hash: string) {
  const personalizedURL = PersonalizedURL.fromRewrite(hash);
  return personalizedURL.options.attributes;
}

export function parsePersonalizedURL(paths: string[]) {
  const hash = paths.slice(-1)[0];
  try {
    const attrs = getUserAttributesFromHash(hash);
    return {
      isPersonzlied: true,
      attributes: attrs,
      pathname: attrs.pathname,
    };
  } catch {
    return {
      isPersonalized: false,
      attributes: null,
      pathname: '/' + (paths.join('/') || ''),
    };
  }
}
