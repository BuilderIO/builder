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
    action(item: any, size: any) {
      return item.replace(/\.jpg|\.png|\.gif|\.jpeg/g, function(match: string) {
        return `_${size}${match}`;
      });
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
