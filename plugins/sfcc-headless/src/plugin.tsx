import {
  CommerceAPIOperations,
  CommercePluginConfig,
  registerCommercePlugin,
} from '@builder.io/commerce-plugin-tools';
import pkg from '../package.json';
import { CategoriesPicker } from './CategoriesPicker';
import { ProductsPicker } from './ProductsPicker';
import appState from '@builder.io/app-context';
import { dataProvider } from './data-provider';

registerCommercePlugin(
  {
    name: 'Salesforce',
    // should always match package.json package name
    id: pkg.name,
    settings: [
      {
        name: 'baseAPI',
        type: 'URL',
        required: true,
        helperText: 'e.g https://development-test-name.demandware.net',
      },
      {
        name: 'store',
        type: 'text',
        required: true,
        helperText: 'Store or library identifier, e.g STORE_NAME_US',
      },
      {
        name: 'clientId',
        friendlyName: 'API Client ID',
        type: 'text',
        required: true,
        helperText: 'your API client identifier, e.g c418989-12312-49d1-...',
      },
      {
        name: 'countryCode',
        type: 'text',
        helperText: 'the default country code e.g: US',
      },
      {
        name: 'version',
        friendlyName: 'OCAPI Version',
        type: 'text',
        helperText: 'defaults to v20_4',
      },
      {
        name: 'locale',
        type: 'text',
        helperText: 'default locale, e.g: en-US',
      },
    ],
    noPreviewTypes: true,
    ctaText: `Connect your Saleforce site`,
  },
  async settings => {
    const baseAPI = settings.get('baseAPI')?.trim();
    const countryCode = settings.get('countryCode')?.trim() || 'US';
    const locale = settings.get('locale')?.trim() || 'en-US';
    const store = settings.get('store')?.trim();
    const clientId = settings.get('clientId')?.trim();
    const version = settings.get('version')?.trim() || 'v20_4';

    const baseURL = `${baseAPI}/s/${store}/dw/shop/${version}`;
    const basicCache = new Map();

    const proxyFetch = (url: string) => {
      return fetch(proxyURL(url));
    };

    const proxyURL = (url: string) => {
      const proxied = new URL(url);
      proxied.searchParams.set('client_id', clientId);
      return `${appState.config.apiRoot()}/api/v1/proxy-api?debug=true&apiKey=${
        appState.user.apiKey
      }&url=${encodeURIComponent(proxied.toString())}`;
    };

    const transformResource = (resource: any) => ({
      ...resource,
      id: resource.id,
      title: `[${resource.id}] ${resource.name || 'Untitled'} `,
      handle: resource.slug,
      ...(resource.c_imageURL && {
        image: {
          src: resource.c_imageURL,
        },
      }),
    });

    const service: CommerceAPIOperations = {
      product: {
        resourcePicker: ProductsPicker,

        async findById(id: string) {
          const product =
            basicCache.get(id) ||
            (await proxyFetch(
              `${baseURL}/products/${id}?display=standard&locale=${locale}&country-code=${countryCode}`
            )
              .then(res => res.json())
              .then((res: any) => {
                if (res.fault) {
                  throw res.fault;
                }
                return res;
              }));

          basicCache.set(id, product);
          return transformResource(product);
        },
        async search(search: string, offset, limit) {
          const [category, q] = (search || '').split(':');
          const key = `search:product:${search}:${offset}:${limit}`;
          const response =
            basicCache.get(key) ||
            (await proxyFetch(
              `${baseURL}/product_search?count=${limit || 60}&start=${
                offset || 0
              }&refine=c_allowedCountries=ALL|US&refine_1=c_displayOn=standard_usd&refine_2=cgid=${
                category || 'all'
              }&country-code=${countryCode}&locale=${locale}${q ? `&q=${q}` : ''}`
            ).then(res => res.json()));

          basicCache.set(key, response);
          return (response.hits || [])
            .map((hit: any) => ({
              id: hit.product_id,
              name: hit.product_name,
            }))
            .map(transformResource);
        },

        getRequestObject(id: string) {
          return {
            '@type': '@builder.io/core:Request' as const,
            request: {
              url: proxyURL(
                `${baseURL}/products/${id}?display=standard&locale=${locale}&country-code=${countryCode}`
              ),
            },
            options: {
              product: id,
            },
          };
        },
      },
      category: {
        async findById(id: string) {
          const key = `category:${id}`;
          const category =
            basicCache.get(key) ||
            (await proxyFetch(
              `${baseURL}/categories/${id}?display=standard&locale=${locale}&country-code=${countryCode}`
            ).then(res => res.json()));
          basicCache.set(key, category);
          return transformResource(category);
        },
        async search(search: string) {
          const key = `search:category:${search}`;
          const response =
            basicCache.get(key) ||
            (await proxyFetch(
              `${baseURL}/categories/${
                search ? `(${search})` : 'all'
              }?display=standard&locale=${locale}&country-code=${countryCode}`
            ).then(res => res.json()));
          basicCache.set(key, response);
          return (response.categories || response.data?.[0].categories || []).map(
            transformResource
          );
        },

        resourcePicker: CategoriesPicker,

        getRequestObject(id: string) {
          return {
            '@type': '@builder.io/core:Request' as const,
            request: {
              url: proxyURL(
                `${baseURL}/categories/${id}?display=standard&locale=${locale}&country-code=${countryCode}`
              ),
            },
            options: {
              category: id,
            },
          };
        },
      },
    };

    appState.registerDataPlugin(
      dataProvider(proxyURL, {
        baseURL,
        defaultCountryCode: countryCode,
        defaultLocale: locale,
      })
    );

    return service;
  }
);
