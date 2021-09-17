import { CommerceAPIOperations, registerCommercePlugin } from '@builder.io/commerce-plugin-tools';
import { Resource } from '@builder.io/commerce-plugin-tools/dist/types/interfaces/resource';
import contentstack from 'contentstack';
import pkg from '../package.json';

interface ContentType {
  title: string;
  uid: string;
  [index: string]: any;
}

interface Result {
  object: () => any;
}

registerCommercePlugin(
  {
    name: 'Contentstack',
    id: pkg.name,
    settings: [
      {
        name: 'apiKey',
        type: 'string',
        required: true,
        helperText: 'Get your API Keyfrom here: ...',
      },
      {
        name: 'deliveryToken',
        type: 'string',
        required: true,
        helperText:
          'https://www.contentstack.com/docs/developers/create-tokens/about-delivery-tokens/',
      },
      {
        name: 'environmentName',
        type: 'string',
        required: true,
        helperText: 'Get your Environment Name from here: ...',
      },
    ],
    ctaText: `Connect your ContentStack stack`,
  },
  async settings => {
    const apiKey = settings.get('apiKey')?.trim();
    const deliveryToken = settings.get('deliveryToken')?.trim();
    const environmentName = settings.get('environmentName')?.trim();
    const Stack = contentstack.Stack(apiKey, deliveryToken, environmentName);

    const contentTypesResponse = await Stack.getContentTypes();
    const contentTypes = contentTypesResponse.contentTypes as ContentType[];

    const transformResource = (result: Result): Resource => {
      const resource = result.object();
      return {
        id: resource.id,
        title: resource.title,
        // might wanna make `handle` nullable in commerce-plugin-tools
        handle: resource.slug,
      };
    };

    const resourcesMaps = contentTypes.map(
      ({ title, uid: contentTypeUid }): CommerceAPIOperations => ({
        [title]: (() => {
          const contentTypeQueryer = Stack.ContentType(contentTypeUid);
          return {
            async findById(id: string) {
              const response: Result = await contentTypeQueryer.Entry(id).fetch();
              return transformResource(response);
            },
            async search(search: string) {
              const base = contentTypeQueryer.Query();
              const searchQuery = search === '' ? base.find : base.search(search).find;

              const response: [Result[]] = await searchQuery();

              return response[0].map(transformResource);
            },

            getRequestObject(id: string) {
              return {
                '@type': '@builder.io/core:Request' as const,
                request: {
                  url: `https://cdn.contentstack.io/v3/content_types/${contentTypeUid}/entries/${id}?&environment=${environmentName}`,
                },
              };
            },
          };
        })(),
      })
    );

    const resourcesOperations: CommerceAPIOperations = {};

    resourcesMaps.forEach(resourceMap => {
      Object.assign(resourcesOperations, resourceMap);
    });

    return resourcesOperations;
  }
);
