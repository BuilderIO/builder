import type { NextRequest } from 'next/server';
import { PersonalizedURL, PersonalizedURLOptions } from './personalized-url';
import { getUserAttributes } from './utils';

export function getPersonlizedURL(
  request: NextRequest,
  options: {
    attributes?: Record<string, string>;
    urlConfig?: Partial<PersonalizedURLOptions>;
    cookiesPrefix?: string;
  } = {
    urlConfig: {
      prefix: request.nextUrl.pathname,
    },
  }
) {
  const url = request.nextUrl;
  const query = Object.fromEntries(url.searchParams);
  const allCookies = Object.fromEntries(request.cookies.entries());
  const personlizedURL = new PersonalizedURL({
    pathname: url.pathname,
    // Buffer is not available in middleware environment as of next 12.2 , overriding with btoa
    encode: url => {
      return btoa(url);
    },
    attributes: {
      ...getUserAttributes({ ...allCookies, ...query }, options.cookiesPrefix),
      ...options.attributes,
    },
    ...options.urlConfig,
  });
  url.pathname = personlizedURL.rewritePath();
  return url;
}

export function getUserAttributesFromHash(hash: string) {
  const personlizedURL = PersonalizedURL.fromRewrite(hash);
  return personlizedURL.options.attributes;
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
