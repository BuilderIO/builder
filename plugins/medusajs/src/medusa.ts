import Medusa from "@medusajs/js-sdk"
import {
    StoreProductListParams,
    StoreProductCategoryListParams,
    FindParams,
    StoreProductCategory,
    StoreProduct,
    StoreCollection,
} from "@medusajs/types"
import { transformCategory, transformCollection, transformProduct } from "./utils"


type MedusaConfig = {
    baseUrl: string
    publishableKey: string
}

interface CustomStoreProductCategory extends StoreProductCategory {
    title: string
}

export class MedusaClient {

    medusaSdk;

    constructor({ baseUrl, publishableKey }: MedusaConfig) {
        this.medusaSdk = new Medusa({
            baseUrl,
            publishableKey,
            debug: true,
        })
    }

    async getProductsList(query?: StoreProductListParams): Promise<StoreProduct[]> {
        const response = await this.medusaSdk.store.product.list({
            limit: 20,
            ...query
        })
        return response.products.map(transformProduct)
    }

    async getProduct(id: string): Promise<StoreProduct> {
        const response = await this.medusaSdk.store.product.retrieve(id)
        return transformProduct(response.product)
    }

    async getCollectionsList(query?: StoreProductListParams): Promise<StoreCollection[]> {
        const response = await this.medusaSdk.store.collection.list({
            limit: 20,
            ...query
        })
        return response.collections.map(transformCollection)
    }

    async getCollection(id: string): Promise<StoreCollection> {
        const response = await this.medusaSdk.store.collection.retrieve(id)
        return transformCollection(response.collection)
    }

    async getCategoriesList(query?: FindParams & StoreProductCategoryListParams): Promise<CustomStoreProductCategory[]> {
        const response = await this.medusaSdk.store.category.list({
            limit: 20,
            ...query
        })
        return response.product_categories.map(transformCategory)
    }

    async getCategory(id: string): Promise<CustomStoreProductCategory> {
        const response = await this.medusaSdk.store.category.retrieve(id)
        return transformCategory(response.product_category)
    }

}