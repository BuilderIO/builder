import { CommerceAPIOperations, registerCommercePlugin } from '@builder.io/commerce-plugin-tools';
import { Resource } from '@builder.io/commerce-plugin-tools/dist/types/interfaces/resource';
import contentstack from 'contentstack';
import pkg from '../package.json';

interface Entity {
  title: string;
  uid: string;
  [index: string]: any;
}

interface ContentType extends Entity {
  schema: {
    data_type: string;
    display_name: string;
    reference_to: [string];
    uid: string;
    [index: string]: any;
  }[];
}

interface Result {
  object: () => any;
}

const transformResource = (result: Result): Resource => {
  const resource: Entity = result.object();

  return {
    // fix this in commerce-plugin-tools
    // @ts-ignore
    id: resource.uid,
    title: resource.title,
    // might wanna make `handle` nullable in commerce-plugin-tools
    handle: resource.slug,
  };
};

registerCommercePlugin(
  {
    name: 'Contentstack',
    id: pkg.name,
    settings: [
      {
        name: 'apiKey',
        type: 'string',
        required: true,
        helperText: 'Get your API Key from here: ...',
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
    // `any` override is to fix https://github.com/contentstack/contentstack-javascript/pull/61
    const contentTypes = (contentTypesResponse as any).content_types as ContentType[];

    const contentTypesWithReferences = contentTypes.map(contentType => {
      const references = contentType.schema.filter(field => field.data_type === 'reference');
      // https://www.contentstack.com/docs/developers/apis/content-delivery-api/#include-reference
      const referenceSearchParams = references.map(field => `include[]=${field.uid}`).join('&');

      return { ...contentType, referenceSearchParams };
    });

    const resourcesMaps = contentTypesWithReferences.map(
      ({ title, uid: contentTypeUid, referenceSearchParams }): CommerceAPIOperations => ({
        [title]: {
          async findById(id: string) {
            const response: Result = await Stack.ContentType(contentTypeUid)
              .Entry(id)
              .fetch();
            return transformResource(response);
          },
          async search(search?: string) {
            const searchQuery =
              typeof search === 'string' && search.length > 0
                ? Stack.ContentType(contentTypeUid)
                    .Query()
                    .search(search)
                    .find()
                : Stack.ContentType(contentTypeUid)
                    .Query()
                    .find();

            const response: [Result[]] = await searchQuery;

            return response[0].map(transformResource);
          },

          getRequestObject(id: string) {
            return {
              '@type': '@builder.io/core:Request' as const,
              request: {
                url: `https://cdn.contentstack.io/v3/content_types/${contentTypeUid}/entries/${id}?environment=${environmentName}&${referenceSearchParams}`,
              },
            };
          },
        },
      })
    );

    const resourcesOperations: CommerceAPIOperations = {};

    resourcesMaps.forEach(resourceMap => {
      Object.assign(resourcesOperations, resourceMap);
    });

    return resourcesOperations;
  }
);
