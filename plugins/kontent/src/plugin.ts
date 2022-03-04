import { registerDataPlugin } from '@builder.io/data-plugin-tools';
import pkg from '../package.json';
import { createDeliveryClient } from '@kentico/kontent-delivery';
import appState from '@builder.io/app-context';
import qs from 'qs';
import { withBuilder } from '../../../packages/react/src/functions/with-builder';

const pluginId = pkg.name;
const metaFields = ['environment', 'space', 'revision', 'type'];

registerDataPlugin(
  {
    id: pluginId,
    name: 'Kontent',
    icon:
      'https://raw.githubusercontent.com/Kentico/Home/master/images/kk-logo-shortcut.png',
    settings: [
      {
        name: 'projectId',
        type: 'string',
        required: true,
        helperText:
          'Get your project ID from your Project settings > API keys https://kontent.ai/learn/tutorials/develop-apps/get-content/get-content-items/#a-1-find-your-project-id',
      },
      {
        name: 'accessToken',
        type: 'string',
        required: false,
        helperText:
          'Get your preview API key from your Project settings > API key'
      },
    ],
    ctaText: `Connect your Kontent project`,
  },
  // Observable map of the settings configured above
  async settings => {
    const projectId = settings.get('projectId')?.trim();
    const apiKey = settings.get('apiKey')?.trim();
    const client = await createDeliveryClient({
      projectId: projectId,
      previewApiKey: apiKey,
      defaultQueryConfig: {
        usePreviewMode: !!apiKey
      }
    });
    return {
      async getResourceTypes() {
        const contentTypes = await client.types().toAllPromise();
        // const buildUrl = (url: string, locale: string, single = false) => {
        //   return `${appState.config.apiRoot()}/api/v1/contentful-proxy?${
        //     locale ? `locale=${locale}&` : ''
        //   }single=${single}&select=fields&url=${encodeURIComponent(url)}`;
        // };

        const locales = await client.languages().toAllPromise();
        const localeEnum = locales.data.items
          .map(item => ({ value: item.system.codename, label: item.system.name }))
          .concat([
            {
              label: 'Dynamic (bound to state)',
              value: '{{state.locale || ""}}',
            },
          ]);
        return contentTypes.data.items.map(type => ({
          name: type.system.name,
          id: type.system.id,
          canPickEntries: true,
          entryInputs: () => {
            return [
              {
                name: 'locale',
                type: 'text',
                enum: localeEnum,
              },
            ];
          },
          inputs: () => {
            const acceptableElements = type.elements.filter(element =>
              // TODO validate supported options - https://kontent.ai/learn/reference/delivery-api/#tag/Content-elements
              ['text', 'number', 'url_slug'].includes(element.type)
            );
            const elements: any = [
              {
                name: 'locale',
                type: 'text',
                enum: localeEnum,
              },
              {
                name: 'order',
                type: 'string',
                enum: Object.keys(type.elements)
                  .filter(key => !metaFields.includes(key))
                  .map(key => ({
                    label: key,
                    value: `element.sys.${key}`,
                  }))
              },
            ];

            if (acceptableElements.length > 0) {
              elements.push({
                name: 'fields',
                advanced: true,
                type: 'object',
                friendlyName: `${type.system.name} fields`,
                subFields: acceptableElements.map(element => ({
                  type: element.type,
                  name: element.id,
                  friendlyName: element.name,
                  helperText: `Query by a specific "${element.name}"" on ${type.system.name}`,
                })),
              } as any);
            }

            return elements;
          },
          toUrl: (userOptions: any) => {
            const { locale, ...options } = userOptions;
            // by entry
            // https://cdn.contentful.com/spaces/{space_id}/environments/{environment_id}/entries/{entry_id}?access_token={access_token}
            if (options.entry) {
              // todo: maybe environment should be an input
              return client.item(options.entry).languageParameter(locale).getUrl();
            }
            let elements =
              (options.fields && Object.keys(options.fields).length > 0 && options.fields) || null;
            if (elements) {
              elements = Object.keys(elements).reduce((acc, key) => {
                const omitValue = elements[key] === '';
                return {
                  ...acc,
                  ...(omitValue ? {} : { ['elements.' + key]: elements[key] }),
                };
              }, {});
            }

            const query = client.items()
              .type(type.system.codename)
              .elementsParameter(elements)
              .withCustomParameter('allowDots', 'true')
              .withCustomParameter('skipNulls', 'true');

            // TODO ass other options

            // by query
            return query.languageParameter(locale).getUrl();
          },
        }));
      },
      async getEntriesByResourceType(resourceTypeId: string, options) {

        if(options?.resourceEntryId as string){
          const resourceEntryId = options?.resourceEntryId as string;
          return await client.items()
          .type(resourceTypeId)
          .elementsParameter(["elements." + resourceEntryId])
          .toAllPromise()
          .then(response => response.data.items[0])
          .then(item => {
            return {
              id: item.system.id,
              name: item.elements[resourceEntryId].name
            };
          })
        }
        // TODO options.options?.searchText
      },
    };
  }
);
