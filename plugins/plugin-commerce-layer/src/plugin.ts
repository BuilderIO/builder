import { registerCommercePlugin } from '@builder.io/commerce-plugin-tools';
import pkg from '../package.json';

registerCommercePlugin(
  {
    name: 'CommerceLayer',
    id: pkg.name,
    settings: [
      {
        name: 'clientId',
        type: 'string',
        required: true,
      },
      {
        name: 'clientSecret',
        type: 'string',
        required: true,
      },
    ],
    ctaText: `Connect your CommerceLayer store`,
  },
  settings => {
    const basicCache = new Map();
    const clientId = settings.get('clientId');
    const clientSecret = settings.get('clientSecret');

    const authToken = async () => {
      const response = await fetch(`https://builder.commercelayer.io/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'client_credentials',
          client_id: clientId,
          client_secret: clientSecret,
        }),
      });
      const data = await response.json();
      return data.access_token;
    };

    const baseUrl = (url: string) => {
      const endUrl = `https://builder.commercelayer.io/api/${url}`;
      return endUrl;
    };

    const headers = {
      Accept: `application/vnd.api+json`,
    };

    const transformResource = (resource: any) => ({
      ...resource,
      id: resource.id,
      title: resource?.attributes?.name,
      handle: resource.id,
      image: {
        src: resource?.attributes?.image_url,
      },
    });

    const service = {
      product: {
        async findById(id: string) {
          const token = await authToken();
          const key = `${id}productById`;
          const product =
            basicCache.get(key) ||
            (await fetch(baseUrl(`skus/${id}`), {
              headers: { ...headers, Authorization: 'Bearer ' + token },
            })
              .then(res => res.json())
              .then(res => res.data)
              .then(transformResource));
          basicCache.set(key, product);
          return product;
        },
        async search(search: string) {
          const token = await authToken();
          let queryParams = '?limit=100';
          queryParams += search ? `&name=${search}` : '';
          const response: any = await fetch(baseUrl(`skus${queryParams}`), {
            headers: { ...headers, Authorization: 'Bearer ' + token },
          }).then(res => {
            return res.json();
          });
          return response.data.map(transformResource);
        },
        getRequestObject(id: string) {
          return {
            '@type': '@builder.io/core:Request',
            request: {
              url: baseUrl(`skus/${id}`),
              headers,
            },
            options: {
              product: id,
            },
          };
        },
      },
    };
    return service;
  }
);
