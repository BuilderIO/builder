import { NextResponse } from 'next/server';
import { PersonalizedURL, getUserAttributes } from '@builder.io/personalization-utils';

const excludededPrefixes = ['/favicon', '/api', '/sw.js'];

export default function middleware(request) {
  const url = request.nextUrl;
  let response = NextResponse.next();
  if (!excludededPrefixes.find(path => url.pathname?.startsWith(path))) {
    const query = Object.fromEntries(url.searchParams);
    const personlizedURL = new PersonalizedURL({
      pathname: url.pathname,
      attributes: {
        // optionally add geo information to target by city/country in builder
        city: request.geo?.city || '',
        country: request.geo?.country || '',
        // pass cookies and query [read all values for keys prefixed with `builder.userAttributes`], useful for studio tab navigation and assigning cookies to targeting groups
        ...getUserAttributes({ ...request.cookies, ...query }),
      },
    });
    url.pathname = personlizedURL.rewritePath();
    response = NextResponse.rewrite(url);
  }
  return response;
}
