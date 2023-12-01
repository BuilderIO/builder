import { APIOperations, ResourceType } from '@builder.io/data-plugin-tools';
import { CommerceAPIOperations } from '@builder.io/commerce-plugin-tools';
type BigCommerceResourceType = 'product' | 'category';

const buildHeaders = (headers: any) => {
  return Object.entries(headers)
    .map(([key, value]) => `headers.${key}=${value}`)
    .join('&');
};

function buildBigCommerceUrl({ resource, resourceId, query, limit, headers }) {
  const base = `https://cdn.builder.io/api/v1/proxy-api?url=https%3A%2F%2Fapi.bigcommerce.com%2Fstores%2Fpdfuqrrtbk%2Fv3%2Fcatalog`;
  let path = resource;
  if (path === 'product') {
    path = 'products';
  } else if (path === 'category') {
    path = 'categories';
  }
  if (resourceId) {
    path += `/${resourceId}`;
  }

  // Initialize URLSearchParams object to construct query parameters
  const params = new URLSearchParams();

  // Set 'limit' parameter
  if (limit && resource !== 'category') {
    params.set('limit', limit.toString());
  }

  // Interpret and set 'query' parameter
  if (query) {
    params.set('keyword', query);
  }

  // Construct the full URL
  return `${base}/${path}?${params.toString()}&${buildHeaders(headers)}`;
}

const RESOURCE_TYPES: {
  name: string;
  id: BigCommerceResourceType;
  description: string;
}[] = [
  {
    name: 'Product',
    id: 'product',
    description: 'All of your BigCommerce products.',
  },
  {
    name: 'Category',
    id: 'category',
    description: 'All of your BigCommerce categories.',
  },
];

interface DataPluginConfig extends APIOperations {
  name: string;
  icon: string;
}

export const getDataConfig = (service: CommerceAPIOperations, headers: any): DataPluginConfig => {
  return {
    name: 'BigCommerce',
    icon: 'https://iili.io/JnTyc4s.png', //bigcommerce logo png, should be replaced with a png hosted by builder
    getResourceTypes: async () =>
      RESOURCE_TYPES.map(
        (model): ResourceType => ({
          ...model,
          inputs: () => [
            {
              friendlyName: 'limit',
              name: 'limit',
              type: 'number',
              defaultValue: 10,
              max: 250, // Reflecting BigCommerce's API limit
              min: 1,
            },
            {
              friendlyName: 'Search',
              name: 'query',
              type: 'string',
            },
          ],

          toUrl: ({ entry, query, limit }) =>
            buildBigCommerceUrl({
              query,
              limit,
              resource: model.id,
              resourceId: entry,
              headers,
            }),
          canPickEntries: true,
        })
      ),
    getEntriesByResourceType: async (resourceTypeId, options = {}) => {
      // Fetch entries from BigCommerce using the provided service
      const entry = options.resourceEntryId;
      if (entry) {
        const entryObj = await service[resourceTypeId].findById(entry);

        return [
          {
            id: String(entryObj.id),
            name: entryObj.name || entryObj.title,
          },
        ];
      }

      const response = await service[resourceTypeId].search(options.searchText || '');
      return response.map(result => ({
        id: String(result.id),
        name: result.title,
      }));
    },
  };
};

const transformResource = function (resource: any) {};

function filterOutUndefinedProperties(obj) {
  const filteredEntries = Object.entries(obj).filter(([key, value]) => value !== undefined);
  return Object.fromEntries(filteredEntries);
}
