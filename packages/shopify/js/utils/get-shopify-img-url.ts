export const getShopifyImageUrl = (src: string, size: string) => {
  if (!src) {
    return src;
  }

  // Taken from (and modified) the shopify theme script repo
  // https://github.com/Shopify/theme-scripts/blob/bcfb471f2a57d439e2f964a1bb65b67708cc90c3/packages/theme-images/images.js#L59
  function removeProtocol(path: string) {
    return path.replace(/http(s)?:/, '');
  }

  if (!size) {
    return src;
  }

  if (size === 'master') {
    return removeProtocol(src);
  }

  const match = src.match(/(_\d+x(\d+)?)?(\.(jpg|jpeg|gif|png|bmp|bitmap|tiff|tif)(\?v=\d+)?)/i);

  if (match) {
    const prefix = src.split(match[0]);
    const suffix = match[4];

    return removeProtocol(`${prefix[0]}_${size}${suffix}`);
  } else {
    return null;
  }
};
