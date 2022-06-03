import { CommerceAPIOperations } from '@builder.io/commerce-plugin-tools';

const RESOURCE_TYPES: {
  name: string;
  id: string;
  description: string;
}[] = [
  {
    name: 'Product',
    id: 'product',
    description: 'Pick a single product from your Salesforce catalog.',
  },
  {
    name: 'Category',
    id: 'category',
    description: 'Pick a single category from your Salesforce catalog.',
  },
];

export const dataProvider = (
  proxyURL: (url: string) => string,
  config: {
    baseURL: string;
    defaultCountryCode: string;
    defaultLocale: string;
  }
) => ({
  name: 'Saleforce',
  icon: 'https://cdn.builder.io/api/v1/image/assets%2F864765e8a4e8491d8d2558bb50417df1%2Fa69f493ae61e4a0790da2feaafdf4eeb',
  getResourceTypes: async () =>
    RESOURCE_TYPES.map(model => ({
      ...model,
      inputs: () => [{ friendlyName: ` `, name: model.id, type: `Salesforce${model.name}` }],
      toUrl: (options: any) => {
        if (options[model.id]) {
          return options[model.id].request.url;
        }
        return '';
      },
      canPickEntries: false,
    })).concat([
      {
        canPickEntries: false,
        name: 'ProductQuery',
        id: 'product_search',
        description: 'Query and filter to choose a subset of your salesforce products.',
        inputs: () => [
          {
            name: 'categoryRequest',
            friendlyName: 'Category',
            helperText: 'Filter By Category',
            type: 'SalesforceCategory',
          },
          {
            name: 'q',
            friendlyName: 'keyword',
            helperText: 'Filter By Keyword',
            type: 'text',
          },
          {
            name: 'countryCode',
            advanced: true,
            helperText: 'Filter By country code',
            type: 'text',
          },
          {
            name: 'locale',
            helperText: 'Filter By specific locale',
            type: 'text',
          },
          {
            name: 'limit',
            helperText: '',
            type: 'number',
            min: 0,
            max: 61,
          } as any,
          {
            name: 'offset',
            helperText: '',
            type: 'number',
            min: 0,
          } as any,
        ],
        toUrl: (options: any) => {
          const {
            limit = 60,
            offset = 0,
            countryCode = config.defaultCountryCode,
            locale = config.defaultLocale,
            categoryRequest,
            q,
          } = options;

          let category = '';
          if (categoryRequest) {
            category = categoryRequest.options.category;
          }
          const url = `${config.baseURL}/product_search?count=${limit || 60}&start=${
            offset || 0
          }&refine=c_allowedCountries=ALL|US&refine_1=c_displayOn=standard_usd&refine_2=cgid=${
            category || 'all'
          }&country-code=${countryCode}&locale=${locale}${q ? `&q=${q}` : ''}`;
          return proxyURL(url);
        },
      },
    ]),
});
