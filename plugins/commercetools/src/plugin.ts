import { registerCommercePlugin } from '@builder.io/commerce-plugin-tools';
import { Resource } from '@builder.io/commerce-plugin-tools/dist/types/interfaces/resource';
import pkg from '../package.json';
import { createRequestBuilder } from '@commercetools/api-request-builder';
const getToken = async (options: {
  clientId: string;
  secret: string;
  authUrl: string;
  projectKey: string;
}) => {
  const { authUrl, clientId, secret, projectKey } = options;
  const response = await fetch(
    `${authUrl}/oauth/token?grant_type=client_credentials&scope=view_products:${projectKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${btoa(`${clientId}:${secret}`)}`,
      },
    }
  ).then(res => res.json());

  return response;
};

registerCommercePlugin(
  {
    name: 'Commercetools',
    id: pkg.name,
    settings: [
      {
        name: 'projectKey',
        type: 'string',
        required: true,
      },
      {
        name: 'clientId',
        type: 'string',
        required: true,
      },
      {
        name: 'secret',
        type: 'password',
        required: true,
      },
      {
        name: 'scopes',
        type: 'string',
        required: true,
      },
      {
        name: 'apiUrl',
        type: 'string',
        required: true,
      },
      {
        name: 'authUrl',
        type: 'string',
        required: true,
      },
    ],
    ctaText: `Connect your Commercetools API`,
  },
  async settings => {
    const basicCache = new Map();

    const clientId = settings.get('clientId');
    const secret = settings.get('secret');
    const scopes = settings.get('scopes');
    const projectKey = settings.get('projectKey');
    const authUrl = new URL(settings.get('authUrl')).origin;
    const apiUrl = new URL(settings.get('apiUrl')).origin;

    const token = await getToken({ authUrl, projectKey, clientId, secret });
    const headers = {
      Authorization: `${token.token_type} ${token.access_token}`,
    };

    const transform = (resource: any) => ({
      ...resource,
      title:
        typeof resource.name === 'string'
          ? resource.name
          : resource.name?.['en-US'] || resource.masterData?.current.name['en-US'],
      handle:
        typeof resource.slug === 'string'
          ? resource.slug
          : resource.slug?.['en-US'] || resource.masterData?.current.slug['en-US'],
    });

    const service = {
      product: {
        async findById(id: string): Promise<Resource> {
          const requestBuilder = createRequestBuilder({ projectKey });
          let request = requestBuilder.products.byId(id);
          const product = await fetch(`${apiUrl}${request.build()}`, {
            headers,
          }).then(res => res.json());
          return transform(product);
        },

        async findByHandle(handle: string): Promise<Resource> {
          const requestBuilder = createRequestBuilder({ projectKey });
          let request = requestBuilder.products.byKey(handle);
          const product = await fetch(`${apiUrl}${request.build()}`, {
            headers,
          }).then(res => res.json());
          return transform(product);
        },
        async search(search: string): Promise<Resource[]> {
          const requestBuilder = createRequestBuilder({ projectKey });
          let request = requestBuilder.products;
          if (search) {
            request = request.where(
              `masterData(current(slug(en-US="${search}") or name(en-US="${search}")))`
            );
          }

          const results = await fetch(`${apiUrl}${request.build()}`, {
            headers,
          })
            .then(res => res.json())
            .then(res => res.results.map((product: any) => transform(product)));
          return results;
        },
        getRequestObject(id: string) {
          const requestBuilder = createRequestBuilder({ projectKey });
          return {
            '@type': '@builder.io/core:Request' as const,
            request: {
              url: `${apiUrl}${requestBuilder.products.byId(id)}`,
              headers,
            },
            options: {
              product: id,
              pluginId: pkg.name,
            },
          };
        },
      },
      category: {
        async findById(id: string): Promise<Resource> {
          const requestBuilder = createRequestBuilder({ projectKey });
          let request = requestBuilder.categories.byId(id);
          const product = await fetch(`${apiUrl}${request.build()}`, {
            headers,
          }).then(res => res.json());
          return transform(product);
        },

        async findByHandle(handle: string): Promise<Resource> {
          const requestBuilder = createRequestBuilder({ projectKey });
          let request = requestBuilder.categories.byKey(handle);
          const product = await fetch(`${apiUrl}${request.build()}`, {
            headers,
          }).then(res => res.json());
          return transform(product);
        },
        async search(search: string): Promise<Resource[]> {
          const requestBuilder = createRequestBuilder({ projectKey });
          let request = requestBuilder.categories;
          if (search) {
            request = request.where(`slug(en-US="${search}") or name(en-US="${search}")`);
          }

          const results = await fetch(`${apiUrl}${request.build()}`, {
            headers,
          })
            .then(res => res.json())
            .then(res => res.results.map((product: any) => transform(product)));
          return results;
        },
        getRequestObject(id: string) {
          const requestBuilder = createRequestBuilder({ projectKey });
          return {
            '@type': '@builder.io/core:Request' as const,
            request: {
              url: `${apiUrl}${requestBuilder.categories.byId(id)}`,
              headers,
            },
            options: {
              category: id,
              pluginId: pkg.name,
            },
          };
        },
      },
    };
    return service;
  }
);
