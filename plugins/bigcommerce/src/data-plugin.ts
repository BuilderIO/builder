import { APIOperations, ResourceType } from '@builder.io/data-plugin-tools';
import appState from '@builder.io/app-context';
import { CommerceAPIOperations } from '@builder.io/commerce-plugin-tools';
import pkg from '../package.json';
type BigCommerceResourceType = 'product' | 'category';
import { BuilderStore, BuilderStoreContext } from '@builder.io/react';
import { useContext, useEffect } from 'react';

function buildBigCommerceUrl({
    resource,
    resourceId,
    query,
    limit,
}) {
    const base = `https://cdn.builder.io/api/v1/proxy-api?url=https%3A%2F%2Fapi.bigcommerce.com%2Fstores%2Fpdfuqrrtbk%2Fv3%2Fcatalog`;
    let path = resource;
    if (path === "product") {
        path = "products";
    } else if (path === "category") {
        path = "categories";
    }
    if (resourceId) {

        path += `/${resourceId}`;
    }

    // Initialize URLSearchParams object to construct query parameters
    const params = new URLSearchParams();

    // Set 'limit' parameter
    if (limit) {
        params.set('limit', limit.toString());
    }

    // Interpret and set 'query' parameter
    if (query) {
        params.set('keyword', query);
    }

    // Construct the full URL
    return `${base}/${path}?${params.toString()}`;
}


// const buildPath = ({
//     resource,
//     resourceId,
// }: {
//     resource: BigCommerceResourceType;
//     resourceId?: string;
// }) => {
//     // BigCommerce API paths for products and categories
//     switch (resource) {
//         case 'product':
//             return resourceId ? `products/${resourceId}` : 'products';
//         case 'category':
//             return resourceId ? `categories/${resourceId}` : 'categories';
//         default:
//             throw new Error('Unsupported resource type');
//     }
// };


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

export const getDataConfig = (service: CommerceAPIOperations): DataPluginConfig => {
    return {
        name: 'BigCommerce',
        icon: 'https://iili.io/JnTyc4s.png',
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
                        //this request fails due to lack of auth headers but doesn't seem to affect the functionality
                        buildBigCommerceUrl({
                            query,
                            limit,
                            resource: model.id,
                            resourceId: entry,
                        }),
                    canPickEntries: true,
                })
            ),
        getEntriesByResourceType: async (resourceTypeId, options = {}) => {
            // Fetch entries from BigCommerce using the provided service
            const entry = options.resourceEntryId;

            if (entry) {
                //get the product or category's data
                const entryObj = await service[resourceTypeId].findById(entry);

                //filter out undefined properties
                const newObj = filterOutUndefinedProperties(entryObj)

                //set the product or category data to state
                appState.designerState.editingContentModel.data.set('state', { [resourceTypeId]: newObj })

                //return the product or category title and id for the dropdown
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
                name: result.title
            }));
        },
    };
};

const transformResource = function (resource: any) {

}

function filterOutUndefinedProperties(obj) {
    const filteredEntries = Object.entries(obj).filter(([key, value]) => value !== undefined);
    return Object.fromEntries(filteredEntries);
}