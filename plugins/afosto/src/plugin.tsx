import { registerCommercePlugin } from '@builder.io/commerce-plugin-tools';

const proxyUrl = (endUrl: string) => {
  return `https://builder.io/api/v1/proxy-api?url=${encodeURIComponent(endUrl)}`;
};


registerCommercePlugin(
  {
    name: 'Afosto',
    // should always match package.json package name
    id: '@builder.io/plugin-afosto',
    settings: [
      {
        type: 'text',
        name: 'shopUrl',
        required: true,
        helperText: 'The url to the Afosto shop you want to connect.',
      }
    ],
    ctaText: 'Connect your Afosto shop',
  },
  async settings => {
    const shopUrl = settings.get('shopUrl');
    const headers = {
      'Content-type': 'application/json',
    };

    const transformProduct = (resource: any) => ({
      id: resource.content.slug,
      title: resource.content.name,
      handle: resource.content.slug,
      image: {
        src: resource.content.image_default.filename,
      },
    });

    const transformSuggest = (resource: any) => ({
      id: resource.slug ?? resource.url.replace(shopUrl, ''),
      title: resource?.name ?? resource?.title,
      handle: resource.slug ?? resource.url.replace(shopUrl, ''),
      ...(resource?.image_default ? {
        image: {
          src: resource.image_default.filename,
        },
      } : {}),
    });

    const transformCollection = (resource: any) => ({
      id: resource.current_url.replace(shopUrl, ''),
      title: resource.title,
      handle: resource.current_url.replace(shopUrl, ''),
    });

    return {
      product: {
        async findById(id: string) {
          const response = await fetch(`${shopUrl}${id}`, { headers });
          const product = await response.json();
          return transformProduct(product);
        },
        async findByHandle(handle: string) {
          const response = await fetch(`${shopUrl}${handle}`, { headers });
          const product = await response.json();
          return transformProduct(product);
        },
        async search(search: string) {
          const response = await fetch(`${shopUrl}search/suggest?q=${encodeURI(search)}&version=2`);
          const data = await response.json();

          return data.products.map(transformSuggest);
        },

        getRequestObject(id: string) {
          return {
            '@type': '@builder.io/core:Request' as const,
            request: {
              url: `${shopUrl}${id}`,
              headers,
            },
            options: {
              product: id,
            },
          };
        },
      },
      category: {
        async findById(id: string) {
          const response = await fetch(`${shopUrl}${id}`, { headers });
          const category = await response.json();
          return transformCollection(category);
        },
        async findByHandle(handle: string) {
          const response = await fetch(`${shopUrl}${handle}`, { headers });
          const category = await response.json();
          return transformCollection(category);
        },
        async search(search: string) {
          const response = await fetch(`${shopUrl}search/suggest?q=${encodeURI(search)}&version=2`);
          const data = await response.json();

          return data.pages.map(transformSuggest);
        },

        getRequestObject(id: string) {
          return {
            '@type': '@builder.io/core:Request' as const,
            request: {
              url: `${shopUrl}${id}`,
              headers,
            },
            options: {
              category: id,
            },
          };
        },
      },
    };
  }
);
