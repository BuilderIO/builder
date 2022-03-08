import { APIOperations, ResourceEntryType, ResourceType } from '@builder.io/data-plugin-tools';
import appState from '@builder.io/app-context';
import { CommerceAPIOperations } from '@builder.io/commerce-plugin-tools';

type ShopifyResourceType = 'product' | 'collection';

const buildPath = ({
  resource,
  resourceId,
}: {
  resource: ShopifyResourceType;
  resourceId?: string;
}) => {
  if (resourceId) {
    return `${resource}/${resourceId}`;
  } else {
    switch (resource) {
      case 'collection':
        // we have a unified collection search endpoint
        return `search/collection`;
      case 'product':
        return `search/product`;
    }
  }
};

const buildShopifyUrl = ({
  resource,
  resourceId,
  query,
  first,
}: {
  resource: ShopifyResourceType;
  resourceId?: string;
  query?: string;
  first?: number;
}) => {
  const base = `${appState.config.apiRoot()}/api/v1/shopify/storefront`;
  const path = buildPath({ resource, resourceId });

  const search = new URLSearchParams({
    apiKey: appState.user.apiKey!,
    query: query ? `title:*${query}*` : '',
    first: (first || 20).toString(),
    sortKey: 'title',
  });

  return `${base}/${path}?${search}`;
};

const RESOURCE_TYPES: {
  name: string;
  id: ShopifyResourceType;
  description: string;
}[] = [
  {
    name: 'Product',
    id: 'product',
    description: 'All of your Shopify custom app products.',
  },
  {
    name: 'Collection',
    id: 'collection',
    description: 'All of your Shopify custom app products.',
  },
];

interface DataPluginConfig extends APIOperations {
  name: string;
  icon: string;
}

export const getDataConfig = (service: CommerceAPIOperations): DataPluginConfig => {
  return {
    name: 'Shopify',
    icon:
      'https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Fc9156e9ba658458db6fcad3f101773c7',
    getResourceTypes: async () =>
      RESOURCE_TYPES.map(
        (model): ResourceType => ({
          ...model,
          inputs: () => [
            { friendlyName: 'limit', name: 'first', type: 'number', defaultValue: 10 },
            { friendlyName: 'Search', name: 'query', type: 'string' },
          ],
          toUrl: ({ entry, query, first }) =>
            buildShopifyUrl({
              query,
              first,
              resource: model.id,
              resourceId: entry,
            }),
          canPickEntries: true,
        })
      ),
    getEntriesByResourceType: async (resourceTypeId, options = {}) => {
      const resourceId = options.resourceEntryId;
      const contentUrl = buildShopifyUrl({
        resourceId,
        resource: resourceTypeId as ShopifyResourceType,
        ...options,
      });

      const response = await fetch(contentUrl).then(res => res.json());

      const results = resourceId ? [response[resourceTypeId]] : response[`${resourceTypeId}s`];

      return results.map(
        (result: any): ResourceEntryType => ({
          id: result.id,
          name: result.title,
        })
      );
    },
  };
};
