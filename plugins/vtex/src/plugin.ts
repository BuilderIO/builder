import { registerCommercePlugin } from '@builder.io/commerce-plugin-tools';
import { gateway } from '@moltin/sdk';
import pkg from '../package.json';
/**
 * 
 * Account Name: schneiderinternal
Secret key: OYJEGVWPBKLSHPZIVLQVZVYKNBGEQRZFPTULIDCFXZPOQBZZMBGXKGOTAYREPSZKLGCOVOASJKXAGKULCGSOLCVIEAKKLXQFAFDKZKEXBNNZJNMQEGCJZKYIKTJUEPGM
Access KEY: vtexappkey-schneiderinternal-GCKAEM

 */
registerCommercePlugin(
  {
    name: 'Vtex',
    id: pkg.name,
    settings: [
      {
        name: 'accountName',
        type: 'string',
        required: true,
      },
      {
        name: 'secretKey',
        type: 'string',
        required: true,
      },
      {
        name: 'accessKey',
        type: 'string',
        required: true,
      },
      ,
      {
        name: 'environment',
        type: 'string',
        required: true,
        defaultValue: 'vtexcommercestable'
      },
    ],
    ctaText: `Connect your Vtex store`,
  },
  settings => {
    const basicCache = new Map();

    const secretKey = settings.get('secretKey');
    const accessKey = settings.get('accessKey');
    const accountName = settings.get('accountName');
    const environment = settings.get('environment') || 'vtexcommercestable';

    const baseUrl = (url: string, shouldProxy = true) => { 
      const endUrl = `https://${accountName}.${environment}.com.br/${url}`
      console.log
      if (!shouldProxy) {
        return endUrl;
      }
      return `http://localhost:5000/api/v1/proxy-api?url=${encodeURIComponent(endUrl)}`;
    }

    const headers = {
      'X-VTEX-API-AppToken': secretKey,
      'X-VTEX-API-AppKey': accessKey,
      Accept: 'application/json; charset=utf-8',
      'Content-Type': 'application/json',
    };

    const transformProduct = (product: any) => ({
      id: product.Id || product.id || product.productId || product.items?.[0]?.productId,
      title: product.name || product.Name || product.productName,
      handle: product.linkText || product.items?.[0]?.linkText || product.href?.split('/').reverse()[1],
      ...(product.images && {
        image: {
          src: product.images[0]?.imageUrl,
        },
      }),
      ...(product.thumbUrl && {
        image: {
          src: product.thumbUrl,
        },
      }),

    });

    return {
      product: {
        async findById(id: string) {
          console.log('findById here ', id);
          const key = `${id}productById`;
          // https://{accountName}.{environment}.com.br/api/catalog/pvt/product/productId
          const product =
            basicCache.get(key) ||
            (await fetch(baseUrl(`api/catalog/pvt/product/${id}`), { headers })
              .then(res => res.json())
              .then(transformProduct));
          basicCache.set(key, product);
          return product;
        },

        async findByHandle(handle: string) {
          console.log('findByHandle here ', handle);
          // https://{accountName}.{environment}.com.br/api/catalog_system/pub/products/search/product-text-link/p
          const response =
            (await fetch(baseUrl(`api/catalog_system/pub/products/search/${handle}/p`), {
              headers,
            }).then(res => res.json()));
          const product = response.map(transformProduct)[0];
          return product;
        },
        async search(search: string) {
          const response: any = await fetch(baseUrl(`/buscaautocomplete?productNameContains=${search}`), {
            headers,
          }).then(res => {
            console.log('here in rest' , res);
            return res.json();
          }).catch(res => {
            console.log('here in catch2', res);
            throw res;
          });
          return response.itemsReturned.map(transformProduct);
        },

        getRequestObject(id: string) {
          return {
            '@type': '@builder.io/core:Request',
            request: {
              url: baseUrl(`products/${id}`),
            },
            options: {
              product: id,
            },
          };
        },
      },
      // category: {
      //   async findById(id: string) {
      //     const key = `${id}collectionById`;
      //     const collection =
      //       basicCache.get(key) ||
      //       (await fetch(baseUrl(`categories/${id}`), { headers })
      //         .then(res => res.json())
      //         .then(transformProduct));
      //     basicCache.set(key, collection);
      //     return collection;
      //   },
      //   async findByHandle(handle: string) {
      //     const key = `${handle}collectionByHandle`;
      //     const response =
      //       basicCache.get(key) ||
      //       (await fetch(baseUrl(`categories?where[active]=true&where[slug]=${handle}`), {
      //         headers,
      //       }).then(res => res.json()));
      //     basicCache.set(key, response);
      //     const collection = response.results.map(transformProduct)[0];
      //     return collection;
      //   },
      //   async search(search: string) {
      //     const response = await fetch(baseUrl(`categories?where[active]=true&search=${search}`), {
      //       headers,
      //     }).then(res => res.json());
      //     return response.results.map(transformProduct);
      //   },
      //   getRequestObject(id: string) {
      //     return {
      //       '@type': '@builder.io/core:Request',
      //       request: {
      //         url: baseUrl(`categories/${id}`),
      //       },
      //       options: {
      //         category: id,
      //       },
      //     };
      //   },
      // },
  }
}
);
