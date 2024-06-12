# Builder.io Plugin Tools

Easily connect your custom data sources and ecommerce backends to your Builder.io content!

![Shopify data example](https://imgur.com/BhtUeqK.gif)
![Data source demo](https://cdn.builder.io/o/assets%2FYJIGb4i01jvw0SRdL5Bt%2F25f8482abb53418795404c174e46e8c0%2Fcompressed?apiKey=YJIGb4i01jvw0SRdL5Bt&token=25f8482abb53418795404c174e46e8c0&alt=media&optimized=true)

This package's main exports are `registerCommercePlugin` and `registerDataPlugin`, which allow you to define what your ecommerce backend or data API needs (e.g., apiToken, password, environment), prompt Builder.io users for those settings, and register multiple field types per resource that allow for easy embedding and custom targeting for each resource (products, collections, personas, etc.) in your store or data source.

For real-world examples, check the [@builder.io/ecom-swell-is](../../plugins/swell) and [@builder.io/plugin-contentful](../../plugins/contentful) folders.

## Usage

### Commerce Plugin

```ts
import { registerCommercePlugin } from '@builder.io/plugin-tools';

registerCommercePlugin(
  {
    name: 'Swell',
    id: '@builder.io/ecome-swell-is',
    settings: [
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

### Data Plugin

```ts
import { registerDataPlugin } from '@builder.io/plugin-tools';

registerDataPlugin(
  {
    name: 'Foobar',
    id: '@builder.io/plugin-foobar',
    settings: [
      {
        name: 'foo',
        friendlyName: 'Lorem Ipsum',
        type: 'string',
        required: true,
        helperText:
          'Lorem Ipsum',
      }
    ],
    ctaText: `Connect FooBar`,
  },
  async settings => {
    const spaceId = settings.get('spaceId')?.trim();
    return {
      async getResourceTypes() {
        return [
          {
          name: 'Resource 1',
          id: `resource-1`,
          canPickEntries: true,
          // inputs are the query parameter definitions for your public API
          inputs: () => {
            return [
              {
                name: 'include',
                friendlyName: 'Retrieve linked assets level',
                advanced: true,
                defaultValue: 2,
                // contentful api restricts include to be between 0 and 10
                min: 0,
                max: 10,
                type: 'number',
              },
              {
                name: 'limit',
                defaultValue: 10,
                // contentful api restricts limit to be between 0 and 100
                min: 0,
                max: 100,
                type: 'number',
              },

              {
                name: 'order',
                friendlyName: 'Order By'
                type: 'string',
                enum: ['a', 'b']
              },
            ];
          },
          toUrl: (options: any) => {
            // by entry
            // https://cdn.contentful.com/spaces/{space_id}/environments/{environment_id}/entries/{entry_id}?access_token={access_token}
            if (options.entry) {
              return `https://public.example.com/spacs/${spaceId}/resource/${options.entry}`
            }
            // by query
            const params = qs.stringify(options,
              { allowDots: true, skipNulls: true }
            );
            return  `https://public.example.com/spaces/${spaceId}/search?${params}`
            );
          },
          }
        ]
      },
      async getEntriesByResourceType(typeId: string, options) {
        const results = await fetch(`https://public.example.com/spaces/${spaceId}?${qs.stringify(options)}`)
      },
    };
  }
);
```

## API

### `registerCommercePlugin(config, settingsCallback)`

Registers a commerce plugin with Builder.io.

```ts
export declare const registerCommercePlugin: (
  config: CommercePluginConfig,
  apiOperationsFromSettings: (
    settings: any
  ) => CommerceAPIOperations | Promise<CommerceAPIOperations>
) => Promise<void>;
```

- `config`: An object containing the plugin's name, ID, settings, and CTA text.
- `settingsCallback`: A function that receives the user-provided settings and returns an object with methods for querying and transforming product data.

### `registerDataPlugin(config, settingsCallback)`

Registers a data plugin with Builder.io.

```ts
export declare const registerDataPlugin: (
  config: DataPluginOptions,
  apiOperationsFromSettings: (settings: any) => APIOperations | Promise<APIOperations>
) => Promise<void>;
```

- `config`: An object containing the plugin's name, ID, settings, and CTA text.
- `settingsCallback`: An asynchronous function that receives the user-provided settings and returns an object with methods for querying and transforming data from the external API.

Both `registerCommercePlugin` and `registerDataPlugin` allow you to define the required settings for connecting to your backend, prompt users for these settings, and register various resources and their corresponding field types for easy integration with Builder.io content.
