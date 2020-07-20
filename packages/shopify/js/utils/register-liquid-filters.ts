import { Liquid } from 'liquidjs';
import { getShopifyImageUrl } from './get-shopify-img-url';

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
      return item.toLowerCase().replace(/[&!%]/g, '').replace(/\s+/g, '-');
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
    action(src: string, size: string) {
      return getShopifyImageUrl(src, size);
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
