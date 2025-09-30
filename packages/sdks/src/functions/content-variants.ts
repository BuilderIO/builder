import { getCookieSync } from '../helpers/cookie.js';

export const testCookiePrefix = 'builder.tests';

export function getTestCookie(name: string) {
  return getCookieSync({
    name: `${testCookiePrefix}.${name}`,
    canTrack: true,
  });
}
