import { getCookie, setCookie } from './cookie.js';

export const testCookiePrefix = 'builder.tests';

export function getTestCookie(name: string) {
  return getCookie(`${testCookiePrefix}.${name}`);
}

function parseUrlParams(url: string): Map<string, string> {
  const result = new Map<string, string>();

  try {
    const urlObj = new URL(url);
    const params = urlObj.searchParams;

    for (const [key, value] of params) {
      result.set(key, value);
    }
  } catch (error) {
    console.debug('Error parsing URL parameters:', error);
  }

  return result;
}

export function setTestCookie(contentId: string, variationId: string) {
  // 30 days from now
  const future = new Date();
  future.setDate(future.getDate() + 30);

  // Use the native setCookie function directly
  if (typeof window !== 'undefined') {
    setCookie(`${testCookiePrefix}.${contentId}`, variationId, future);
  }
}

export function setTestsFromUrl() {
  if (typeof window === 'undefined') return;

  try {
    // Use native URL object to parse current page URL
    const params = parseUrlParams(window.location.href);

    // Look for parameters that start with 'builder.tests.'
    for (const [key, value] of params) {
      if (key.startsWith(`${testCookiePrefix}.`)) {
        const testKey = key.replace(`${testCookiePrefix}.`, '');
        setTestCookie(testKey, value);
      }
    }
  } catch (e) {
    console.debug('Error parsing tests from URL', e);
  }
}
