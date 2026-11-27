/**
 * Adds `format=webp` to the URL of each `srcset` candidate. A URL is everything up
 * to the first whitespace and never ends in a comma, and its optional descriptor
 * runs up to the next comma. The fallback candidate from `getSrcSet` usually has no
 * query string, so this cannot rely on every URL containing a `?`.
 */
export function getWebpSrcSet(srcset: string): string {
  return srcset.replace(
    /(\S*[^\s,])(\s+[^,]*)?/g,
    (_, url: string, descriptor = '') =>
      (url.includes('?') ? url.replace('?', '?format=webp&') : `${url}?format=webp`) + descriptor
  );
}
