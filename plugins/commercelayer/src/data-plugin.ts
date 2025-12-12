import { APIOperations, ResourceType, CommerceAPIOperations, BuilderRequest } from '@builder.io/plugin-tools';
import appState from '@builder.io/app-context';
import pkg from '../package.json';
import { CommerceLayerResourceType, RESOURCE_ENDPOINTS } from './service';

const buildCommerceLayerUrl = ({
  resource,
  resourceId,
  query,
  limit,
  baseEndpoint,
  token,
}: {
  resource: CommerceLayerResourceType;
  resourceId?: string;
  query?: string;
  limit?: number;
  baseEndpoint: string;
  token: string;
}): BuilderRequest => {
  let url: string;
  const endpoint = RESOURCE_ENDPOINTS[resource];
  
  if (resourceId) {
    // Get specific product by ID
    url = `${baseEndpoint}/api/${endpoint}/${resourceId}`;
  } else {
    // Search products
    const params = new URLSearchParams();
    if (query) {
      params.set('filter[q][name_or_code_cont]', query);
    }
    params.set('page[size]', (limit || 25).toString());
    url = `${baseEndpoint}/api/${endpoint}?${params}`;
  }

  return {
    '@type': '@builder.io/core:Request',
    request: {
      url,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
      }
    },
    options: {
      resource,
      resourceId,
      pluginId: pkg.name
    }
  };
};

const RESOURCE_TYPES: {
  name: string;
  id: CommerceLayerResourceType;
  description: string;
}[] = [
  {
    name: 'Product',
    id: 'product',
    description: 'All of your Commerce Layer products (SKUs).',
  },
  {
    name: 'Bundle',
    id: 'bundle',
    description: 'All of your Commerce Layer bundles.',
  },
];

interface DataPluginConfig extends APIOperations {
  name: string;
  icon: string;
}

export const getDataConfig = (
  service: CommerceAPIOperations,
  baseEndpoint: string,
  token: string
): DataPluginConfig => {
  return {
    name: 'CommerceLayer',
    icon: 'https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F9893958430eb4c59af7ab616ba868941',
    getResourceTypes: async () =>
      RESOURCE_TYPES.map(
        (model): ResourceType => ({
          ...model,
          inputs: () => [
            {
              friendlyName: 'Limit',
              name: 'limit',
              type: 'number',
              defaultValue: 25,
              max: 100,
              min: 1,
            },
            { 
              friendlyName: 'Search', 
              name: 'query', 
              type: 'string',
              helperText: model.id === 'product' 
                ? 'Search by product name or SKU code'
                : 'Search by bundle name or code'
            },
          ],
          toUrl: ({ entry, query, limit }) =>
            buildCommerceLayerUrl({
              query,
              limit,
              resource: model.id,
              resourceId: entry,
              baseEndpoint,
              token,
            }) as any,
          canPickEntries: true,
        })
      ),
    getEntriesByResourceType: async (resourceTypeId, options = {}) => {
      const entry = options.resourceEntryId;

      if (entry) {
        const entryObj = await service[resourceTypeId].findById(entry);
        return [
          {
            id: String(entryObj.id),
            name: entryObj.title,
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
