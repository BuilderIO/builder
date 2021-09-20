import contentstack from 'contentstack';
import pkg from '../package.json';
import { registerDataPlugin, ResourceType, ResourceEntryType } from '@builder.io/data-plugin-tools';
import kebabCase from 'lodash/capitalize';
import capitalize from 'lodash/kebabCase';
import appState from '@builder.io/app-context';

function humanCase(str = '') {
  if (str.includes('$')) {
    // kebabCase removes the $ but we need to keep it for chart names
    return capitalize(str.replace(/[- ]+/g, ' ').trim());
  }
  return capitalize(
    kebabCase(str)
      .replace(/[- ]+/g, ' ')
      .trim()
  );
}

interface Entity {
  title: string;
  uid: string;
  [index: string]: any;
}

interface ContentType extends Entity {
  description: string;
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

registerDataPlugin(
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

    return {
      getResourceTypes: async () => {
        const contentTypesResponse = await Stack.getContentTypes();
        // `any` override is to fix https://github.com/contentstack/contentstack-javascript/pull/61
        const contentTypes = (contentTypesResponse as any).content_types as ContentType[];
        const contentTypesWithReferences = contentTypes.map(contentType => {
          const references = contentType.schema.filter(field => field.data_type === 'reference');
          // https://www.contentstack.com/docs/developers/apis/content-delivery-api/#include-reference
          const referenceSearchParams = references.map(field => `include[]=${field.uid}`).join('&');

          return { ...contentType, referenceSearchParams };
        });

        const buildHeaders = () => {
          const headers = {
            api_key: apiKey,
            access_token: deliveryToken,
          };

          return Object.entries(headers)
            .map(([key, value]) => `headers[]=${key}:::${value}`)
            .join('&');
        };

        // For other providers use their APIs for this ofc (and plugin settings for keys)
        return contentTypesWithReferences.map(
          (model): ResourceType => ({
            name: humanCase(model.title),
            id: model.uid,
            description: model.description,
            inputs: () => [{ name: 'limit', type: 'number', defaultValue: 10 }],
            toUrl: options => {
              const buildUrl = (url: string) => {
                const endUrl = `https://cdn.contentstack.io/v3/content_types/${model.uid}/${url}`;
                return `${appState.config.apiRoot()}/api/v1/proxy-api?url=${encodeURIComponent(
                  endUrl
                )}&${buildHeaders()}`;
              };

              const entry =
                /* TODO: wrapper so this '_new' logic  not needed */
                options.entry !== '_new' && options.entry;

              const envName = `environment=${environmentName}`;
              if (entry) {
                return buildUrl(`entries/${entry}?${envName}&${model.referenceSearchParams}`);
              }

              return buildUrl(`entries?${envName}`);
            },
            canPickEntries: true,
          })
        );
      },
      getEntriesByResourceType: async (
        resourceTypeId: string,
        options: { searchText?: string; resourceEntryId?: string } = {}
      ) => {
        const StackForContentType = Stack.ContentType(resourceTypeId);

        const makeApiRequest = (options: { searchText?: string; resourceEntryId?: string }) => {
          if (options.resourceEntryId) {
            return StackForContentType.Entry(options.resourceEntryId)
              .fetch()
              .then(res => [res]);
          } else if (options.searchText) {
            return StackForContentType.Query()
              .search(options.searchText)
              .find()
              .then(res => res[0]);
          } else {
            return StackForContentType.Query()
              .find()
              .then(res => res[0]);
          }
        };

        const response: Result[] = await makeApiRequest(options);

        return response.map(
          (result): ResourceEntryType => {
            const item = result.object();
            return {
              id: item.uid,
              name: item.title,
            };
          }
        );
      },
    };
  }
);
