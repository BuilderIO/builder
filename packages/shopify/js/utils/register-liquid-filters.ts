import { Liquid } from 'liquidjs';

const filters = [
  {
    name: 'money',
    action(value: any) {
      const str = String(value);
      return ('$' + str.slice(0, -2) + '.' + str.slice(-2)).replace('..', '.');
    },
  },
  {
    name: 'handle',
    action(item: any) {
      return item
        .toLowerCase()
        .replace(/[&!%]/g, '')
        .replace(/\s+/g, '-');
    },
  },
  {
    name: 'strip_html',
    action(item: any) {
      return item.replace(/<[^>]+>/g, '');
    },
  },
  {
    name: 'img_url',
    action(src: any, size: any) {
      // Taken from the shopify theme script repo
      // https://github.com/Shopify/theme-scripts/blob/bcfb471f2a57d439e2f964a1bb65b67708cc90c3/packages/theme-images/images.js#L59
      function removeProtocol(path: string) {
        return path.replace(/http(s)?:/, '');
      }

      if (size === null) {
        return src;
      }

      if (size === 'master') {
        return removeProtocol(src);
      }

      const match = src.match(/\.(jpg|jpeg|gif|png|bmp|bitmap|tiff|tif)(\?v=\d+)?$/i);

      if (match) {
        const prefix = src.split(match[0]);
        const suffix = match[0];

        return removeProtocol(`${prefix[0]}_${size}${suffix}`);
      } else {
        return null;
      }
    },
  },
  {
    name: 'truncatewords',
    action(item: any, numWords: any) {
      const words = item.split(/\s+/g);
      return `${words.slice(0, numWords).join(' ')}...`;
    },
  },
];

export const registerLiquidFilters = (liquid: Liquid) => {
  for (const filter of filters) {
    liquid.registerFilter(filter.name, filter.action);
  }

  const tempNoopFilters = ['t'];
  for (const tempNoopFilter of tempNoopFilters) {
    liquid.registerFilter(tempNoopFilter, value => value);
  }
};
