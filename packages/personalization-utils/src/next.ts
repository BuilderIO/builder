import type { NextRequest } from 'next/server';
import { PersonalizedURL } from './personalized-url';
import { getUserAttributes } from './utils';

export function getPersonlizedURL(request: NextRequest) {
    // TODO: any needed type is coming as string, but it should be NextURL
    const url = request.url as any;
    const query = Object.fromEntries(url.searchParams);
    const allCookies = Array.from(request.cookies.entries()).reduce((acc, [key]) => ({
      ...acc,
      [key]: request.cookies.get(key),
    }), {})
    const personlizedURL = new PersonalizedURL({
      pathname: url.pathname,
      // Buffer is not available in middleware environment as of next 12.2 , overriding with btoa
      encode: (url) => {
        return btoa(url);
      },
      attributes: {
        ...getUserAttributes({ ...allCookies, ...query }),
        domain: request.headers.get('Host') || '',
        country: request.geo?.country || '',
      }
    })
    url.pathname = personlizedURL.rewritePath();
    return url;
}

export function getUserAttributesFromHash(hash: string) {
    const personlizedURL = PersonalizedURL.fromRewrite(hash);
    return personlizedURL.options.attributes;
}
