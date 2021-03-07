# Builder.io Commerce plugin tools

Easily connect your custom ecommerce backend data to your Builder.io content!

<img alt="Shopify data example" src="https://imgur.com/BhtUeqK.gif" >

This package main expor is `registerCommercePlugin`, which will allow you to define what your ecommerce backend needs ( apiToken, password), prompt Builder.io users for it and register multiple field types per resource that allow for easy embedding and custom targeting for each resource ( products, collections, personas ...etc) in your ecommerce store.

for real world example check the [@builder.io/ecom-swell-is](../../plugins/swell) folder.

```ts
import { registerCommercePlugin } from '@builder.io/commerce-plugin-tools';

registerCommercePlugin(
  {
    name: 'Swell',
    id: '@builder.io/ecome-swell-is',
    settings: [
      // list of information needed to connect store, optional
      {
        name: 'storeId',
        type: 'string',
        required: true,
        helperText:
          'Get your Store ID from swell store settings https://swell.store/docs/api/?javascript#authentication',
      },
      {
        name: 'secretKey',
        type: 'string',
        required: true,
        helperText:
          'Get your Secret key from swell store settings https://swell.store/docs/api/?javascript#authentication',
      },
    ],
    ctaText: `Connect your swell.is store`,
  },
  /**
   * settings here will be an observable map of the settings you configured above in settings,
   *  ( in this example settings.get('storeId') will give us the storeId entered by user)
   */
  settings => {
    // setup basic cache for a better user experience
    const basicCache = new Map();
    const baseUrl = (url: string) =>
      'https://builder.io/api/v1/proxy-api?url=' +
      encodeURIComponent('https://api.swell.store/' + url);
    const headers = {
      Authorization: `Basic ${btoa(`${settings.get('storeId')}:${settings.get('secretKey')}`)}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };

    // always transform product to match Resource interface, ts will notify you if not
    const transformProduct = (product: any) => ({
      id: product.id,
      title: product.name,
      handle: product.slug,
      ...(product.images && {
        image: {
          src: product.images[0]?.file.url,
        },
      }),
    });

    return {
      product: {
        async findById(id: string) {
          const key = `${id}productById`;
          const product =
            basicCache.get(key) ||
            (await fetch(baseUrl(`products/${id}`), { headers })
              .then(res => res.json())
              .then(transformProduct));
          basicCache.set(key, product);
          return product;
        },
        async findByHandle(handle: string) {
          const key = `${handle}productByHandle`;
          const response =
            basicCache.get(key) ||
            (await fetch(baseUrl(`products?where[active]=true&where[slug]=${handle}`), {
              headers,
            }).then(res => res.json()));
          basicCache.set(key, response);
          const product = response.results.map(transformProduct)[0];
          return product;
        },
        async search(search: string) {
          const response = await fetch(baseUrl(`products?where[active]=true&search=${search}`), {
            headers,
          }).then(res => res.json());
          return response.results.map(transformProduct);
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
    };
  }
);
```
