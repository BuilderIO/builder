import { registerCommercePlugin } from '@builder.io/commerce-plugin-tools';
import pkg from '../package.json';
import { CategoriesPicker } from './CategoriesPicker';
/**
 * Category API – Returns the list of categories

https://www.jcrew.com/browse/categories/(${comma,separated,categories})?levels=2&country-code=US

Example: https://www.jcrew.com/browse/categories/(mens,womens)?levels=2&country-code=US

 

Array page API – Returns the list of products within a category/folder:

https://www.jcrew.com/browse/product_search?expand=prices,variations,availability&count=60&refine=category_id&refine_1=c_displayOn=standard&refine_2=c_allowedCountries=ALL|US&locale=en-US&country-code=US

Example: https://www.jcrew.com/browse/product_search?expand=variations,availability&count=60&start=0&refine=c_allowedCountries=ALL|US&refine_1=c_displayOn=standard_usd&refine_2=cgid=womens|categories|clothing|sweaters&country-code=US

 

Product API – Returns the details of a product:

https://www.jcrew.com/browse/products/{product_id}?expand=availability,variations&display=all&locale=en-US&country-code=US

Example: https://www.jcrew.com/browse/products/BF721?expand=availability,variations&display=standard&locale=en-US&country-code=US
 */

const proxyFetch = (url: string) => {
  console.log(
    'proxying to ',
    `http://localhost:4000/api/v1/proxy-api?url=${encodeURIComponent(url)}`
  );
  return fetch(`http://localhost:4000/api/v1/proxy-api?url=${encodeURIComponent(url)}`);
};

registerCommercePlugin(
  {
    name: 'Salesforce',
    // should always match package.json package name
    id: pkg.name,
    settings: [
      {
        name: 'baseURL',
        type: 'URL',
        required: true,
        helperText: 'https://jcrew.com',
      },
      {
        name: 'countryCode',
        type: 'text',
        required: true,
        helperText: 'the default country code e.g: US',
      },
      {
        name: 'locale',
        type: 'text',
        required: true,
        helperText: 'default locale, e.g: en-US',
      },
    ],
    noPreviewTypes: true,
    ctaText: `Connect your Saleforce site`,
  },
  async settings => {
    const baseURL = settings.get('baseURL')?.trim();
    const countryCode = settings.get('countryCode')?.trim() || 'US';
    const locale = settings.get('locale')?.trim() || 'en-US';

    const transformResource = (resource: any) => ({
      ...resource,
      id: resource.id,
      title: resource.name,
      handle: resource.slug,
      ...(resource.c_imageURL && {
        image: {
          src: resource.c_imageURL,
        },
      }),
    });

    return {
      product: {
        async findById(id: string) {
          // https://www.jcrew.com/browse/products/BF721?expand=availability,variations&display=standard&locale=en-US&country-code=US
          const product = await proxyFetch(
            `${baseURL}/browse/products/${id}?display=standard&locale=${locale}&country-code=${countryCode}`
          ).then(res => res.json());
          return transformResource(product);
        },
        async search(search: string) {
          // https://www.jcrew.com/browse/product_search?count=60&start=0&refine=c_allowedCountries=ALL|US&refine_1=c_displayOn=standard_usd&refine_2=cgid=all&country-code=US
          const response = await proxyFetch(
            `${baseURL}/browse/product_search?count=60&start=0&refine=c_allowedCountries=ALL|US&refine_1=c_displayOn=standard_usd&refine_2=cgid=all&country-code=${countryCode}&locale=${locale}`
          ).then(res => res.json());
          return response.hits.map((hit: any) => ({
            id: hit.product_id,
            title: `${hit.product_name} - (id: ${hit.product_id})`,
          }));
        },

        getRequestObject(id: string) {
          return {
            '@type': '@builder.io/core:Request' as const,
            request: {
              url: `${baseURL}/browse/products/${id}?display=standard&locale=${locale}&country-code=${countryCode}`,
            },
            options: {
              product: id,
            },
          };
        },
      },
      category: {
        async findById(id: string) {
          // https://www.jcrew.com/browse/categories/(mens%7Ccategories%7Cclothing)?country-code=US
          const category = await proxyFetch(
            `${baseURL}/browse/categories/${id}?display=standard&locale=${locale}&country-code=${countryCode}`
          ).then(res => res.json());
          return transformResource(category);
        },
        async search(search: string) {
          // https://www.jcrew.com/browse/categories/all?country-code=US
          const response = await proxyFetch(
            `${baseURL}/browse/categories/${
              search ? `(${search})` : 'all'
            }?display=standard&locale=${locale}&country-code=${countryCode}`
          ).then(res => res.json());
          return (response.categories || response.data?.[0].categories || []).map(
            transformResource
          );
        },

        resourcePicker: CategoriesPicker,

        getRequestObject(id: string) {
          return {
            '@type': '@builder.io/core:Request' as const,
            request: {
              url: `${baseURL}/browse/categories/${id}?display=standard&locale=${locale}&country-code=${countryCode}`,
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
