// Taken from (and modified) the shopify theme script repo
// https://github.com/Shopify/theme-scripts/blob/bcfb471f2a57d439e2f964a1bb65b67708cc90c3/packages/theme-images/images.js#L59
function removeProtocol(path: string) {
  return path.replace(/http(s)?:/, '');
}

function updateQueryParam(
  uri = '',
  key: string,
  value: string | number | boolean
): string {
  const re = new RegExp('([?&])' + key + '=.*?(&|$)', 'i');
  const separator = uri.indexOf('?') !== -1 ? '&' : '?';
  if (uri.match(re)) {
    return uri.replace(re, '$1' + key + '=' + encodeURIComponent(value) + '$2');
  }

  return uri + separator + key + '=' + encodeURIComponent(value);
}
function getShopifyImageUrl(src: string, size: string): string | null {
  if (!src || !src?.match(/cdn\.shopify\.com/) || !size) {
    return src;
  }

  if (size === 'master') {
    return removeProtocol(src);
  }

  const match = src.match(
    /(_\d+x(\d+)?)?(\.(jpg|jpeg|gif|png|bmp|bitmap|tiff|tif)(\?v=\d+)?)/i
  );

  if (match) {
    const prefix = src.split(match[0]);
    const suffix = match[3];
    const useSize = size.match('x') ? size : `${size}x`;

    return removeProtocol(`${prefix[0]}_${useSize}${suffix}`);
  }

  return null;
}

export function getSrcSet(url: string): string {
  if (!url) {
    return url;
  }

  const sizes = [100, 200, 400, 800, 1200, 1600, 2000];

  if (url.match(/builder\.io/)) {
    let srcUrl = url;
    const widthInSrc = Number(url.split('?width=')[1]);
    if (!isNaN(widthInSrc)) {
      srcUrl = `${srcUrl} ${widthInSrc}w`;
    }

    return sizes
      .filter((size) => size !== widthInSrc)
      .map((size) => `${updateQueryParam(url, 'width', size)} ${size}w`)
      .concat([srcUrl])
      .join(', ');
  }

  if (url.match(/cdn\.shopify\.com/)) {
    return sizes
      .map((size) => [getShopifyImageUrl(url, `${size}x${size}`), size])
      .filter(([sizeUrl]) => !!sizeUrl)
      .map(([sizeUrl, size]) => `${sizeUrl} ${size}w`)
      .concat([url])
      .join(', ');
  }

  return url;
}
