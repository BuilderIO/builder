import pkg from '../package.json'
import { registerCommercePlugin } from '@builder.io/commerce-plugin-tools';
import { MedusaClient } from './medusa';
import { transformCategory, transformCollection, transformProduct } from './utils';

registerCommercePlugin(
    {
        id: pkg.name,
        name: 'Medusa',
        noPreviewTypes:true,
        settings: [
            {
                name: 'baseUrl',
                type: 'string',
                helperText: 'A required string indicating the URL to the Medusa backend.',
                required: true,
            },
            {
                name: 'publishableKey',
                type: 'string',
                helperText: 'A string indicating the publishable API key to use in the storefront. You can retrieve it from the Medusa Admin.',
                required: true,
            },
        ],
        ctaText: 'Connect your Medusa custom app'
    },
    async settings => {

        const baseUrl = settings.get('baseUrl')?.trim()
        const publishableKey = settings.get('publishableKey')?.trim()

        const medusaClient = new MedusaClient({
            baseUrl,
            publishableKey
        })

        //Custom input types :  MedusaProduct, MedusaCategory
        return {
            product: {
                async findById(id: string) {
                    return await medusaClient.getProduct(id)
                },
                async findByHandle(handle: string) {
                    const response = await medusaClient.getProductsList({handle})
                    return transformProduct(response.find(Boolean)) 
                },
                async search(search: string) {
                    return await medusaClient.getProductsList({
                        q: search
                    })
                },
                getRequestObject(id: string) {
                    return {
                        "@type": "@builder.io/core:Request" as const,
                        request: {
                            url: `${baseUrl}/store/products/${id}`,
                            headers: {
                                "Content-Type": "application/json",
                                Accept: "application/json; charset=utf-8",
                                "x-publishable-api-key": publishableKey,
                            },
                        },
                        options:{
                            product:id
                        }
                    }
                },
            },
            collection: {
                async findById(id: string) {
                    return await medusaClient.getCollection(id)
                },
                async findByHandle(handle: string) {
                    const response = await medusaClient.getCollectionsList({handle})
                    return transformCollection(response.find(Boolean)) 
                },
                async search(search: string) {
                    return await medusaClient.getCollectionsList({
                        q: search
                    })
                },
                getRequestObject(id: string) {
                    return {
                        "@type": "@builder.io/core:Request" as const,
                        request: {
                            url: `${baseUrl}/store/collections/${id}`,
                            headers: {
                                "Content-Type": "application/json",
                                Accept: "application/json; charset=utf-8",
                                "x-publishable-api-key": publishableKey,
                            },
                        },
                        options:{
                            collection:id
                        }
                    }
                },
            },
            category: {
                async findById(id: string) {
                    return await medusaClient.getCategory(id)
                },
                async findByHandle(handle: string) {
                    const response = await medusaClient.getCategoriesList({handle})
                    return transformCategory(response.find(Boolean)) 
                },
                async search(search: string) {
                    return await medusaClient.getCategoriesList({
                        q: search
                    })
                },
                getRequestObject(id: string) {
                    return {
                        "@type": "@builder.io/core:Request" as const,
                        request: {
                            url: `${baseUrl}/store/product-categories/${id}`,
                            headers: {
                                "Content-Type": "application/json",
                                Accept: "application/json; charset=utf-8",
                                "x-publishable-api-key": publishableKey,
                            },
                        },
                        options:{
                            category:id
                        }
                    }
                },
            }
        }
    }
)