declare module '@builder.io/app-context';

declare namespace ShopifyBuy {
  type Resource = import('@builder.io/plugin-tools/dist/types/interfaces/resource').Resource;

  export interface Product extends ShopifyBuy.Product {
    handle: string;
  }

  export interface Collection extends ShopifyBuy.Collection {
    handle: string;
  }

  interface CollectionResource {
    fetch(id: string): Promise<Resource>;
    fetchByHandle(handle: string): Promise<Resource>;
    fetchQuery(options: ShopifyBuy.Query): Promise<Resource[]>;
  }

  interface ProductResource {
    fetch(id: string): Promise<Resource>;
    fetchByHandle(handle: string): Promise<Resource>;
    fetchQuery(options: ShopifyBuy.Query): Promise<Resource[]>;
  }
}
