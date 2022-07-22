import { registerDataPlugin } from '@builder.io/data-plugin-tools';
import pkg from '../package.json';
import { createDeliveryClient } from '@kentico/kontent-delivery';
import { Input } from '@builder.io/sdk';

// development URL https://localhost:1268/plugin.system.js?pluginId=@builder.io/plugin-kontent-ai

const pluginId = pkg.name;

registerDataPlugin(
  {
    id: pluginId,
    name: 'Kontent.ai',
    icon: 'https://cdn.builder.io/api/v1/image/assets%2F0b9554e4c74747a08f247f55227230e0%2F4830cd357f5f480983ae6e0caf817076',
    settings: [
      {
        name: 'projectId',
        type: 'string',
        required: true,
        helperText: 'Get your project ID from "Project Settings" > "API keys"',
      },
    ],
    ctaText: `Connect your project`,
  },
  // settings will be an Observable map of the settings configured above
  async settings => {
    const projectId = settings.get('projectId')?.trim();

    const client = createDeliveryClient({
      projectId,
    });

    return {
      async getResourceTypes() {
        const languagesResponse = await client.languages().toAllPromise();
        const languagesEnum = languagesResponse.data.items
          .map(language => ({
            value: language.system.codename,
            label: language.system.name,
          }))
          // You can override state from the outside
          .concat([
            {
              label: 'Dynamic (bound to state)',
              value: '{{state.locale || ""}}',
            },
          ]);

        const result = await client.types().toAllPromise();
        return result.data.items.map(type => ({
          name: type.system.name,
          id: type.system.codename,
          canPickEntries: true,
          entryInputs: () => {
            return [
              {
                name: 'language',
                type: 'text',
                enum: languagesEnum,
              },
            ];
          },
          inputs: () => {
            const acceptableElements = type.elements.filter(element =>
              // possible extend to more types https://kontent.ai/learn/reference/delivery-api/#tag/Filtering-content
              ['text'].includes(element.type)
            );
            // return a list of inputs to query your data, think of this as the query schema: limit / offset / specific fields to query against
            const fields = [
              {
                name: 'limit',
                defaultValue: 10,
                min: 0,
                max: 100,
                type: 'number',
              },
              {
                name: 'language',
                type: 'text',
                enum: languagesEnum,
              },
            ];

            if (acceptableElements.length > 0) {
              fields.push({
                name: 'elements',
                advanced: true,
                type: 'object',
                friendlyName: `${type.system.name} elements`,
                subFields: acceptableElements.map(
                  element =>
                    ({
                      type: element.type,
                      name: element.id,
                      helperText:
                        'Exact match only: see https://kontent.ai/learn/reference/delivery-api/#tag/Filtering-content',
                      friendlyName: element.name,
                    } as Input)
                ),
                // ask about this
              } as any);
            }

            return fields;
          },
          toUrl: (options: any) => {
            // by entry
            if (options.entry) {
              const url = client.item(options.entry).getUrl();
              return url;
            }
            // by query, read query values from the schema you defined in inputs above and generate a public url to the results
            const query = client.items().type(type.system.codename);

            if (options.language) {
              query.languageParameter(options.language);
            }

            if (options.limit) {
              query.limitParameter(options.limit);
            }

            return query.getUrl();
          },
        }));
      },
      async getEntriesByResourceType(id: string, options) {
        const query = client.items().type(id);
        const result = await query.toAllPromise();
        if (options?.resourceEntryId) {
          // data plugins UI is asking for a specific entry return [entry]
          const entry = result.data.items.find(
            item => item.system.codename === options.resourceEntryId
          );
          if (entry) {
            return [
              {
                id: entry.system.codename,
                name: entry.system.name,
              },
            ];
          }
        } else if (options?.searchText != undefined) {
          // data plugins UI is asking for the results of a free form search on entries per resource type
          // hit api with searchText and return an array that matches interface Array<{ name: string, id: string}>
          return result.data.items
            .filter(({ system: { name } }) =>
              name.toLowerCase().includes((options?.searchText as string)?.toLowerCase())
            )
            .map(item => ({
              id: item.system.codename,
              name: item.system.name,
            }));
        }
        // no search or specific entry , return all entries for  this specific resource type
        return result.data.items.map(entry => {
          return {
            id: entry.system.codename,
            name: entry.system.name,
          };
        });
      },
    };
  }
);
