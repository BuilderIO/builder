import { registerDataPlugin } from '@builder.io/data-plugin-tools';
import pkg from '../package.json';
import { createDeliveryClient } from '@kentico/kontent-delivery';

// https://localhost:1268/plugin.system.js?pluginId=@builder.io/plugin-kontent

const pluginId = pkg.name;

registerDataPlugin(
  {
    id: pluginId,
    name: 'Kontent',
    icon: 'https://raw.githubusercontent.com/Kentico/Home/master/images/kk-logo-shortcut.png',
    // Settings is optional and it represents what input you need from the user to connect their data
    settings: [
      // Example of a settings input
      {
        name: 'projectId',
        type: 'string',
        required: true,
        helperText:
          'Get your project ID'
      },
    ],
    ctaText: ``,
  },
  // settings will be an Observable map of the settings configured above
  async settings => {
    const projectId = settings.get('projectId')?.trim();

    const client = createDeliveryClient({
      projectId
    });

    return {
      async getResourceTypes() {

        const languagesResponse = await client.languages().toAllPromise();
        const languagesEnum = languagesResponse.data.items
          .map(language => ({ value: language.system.codename, label: language.system.name }))
          // Ask about this
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
            return fields;
          },
          toUrl: (options: any) => {
            // by entry
            if (options.entry) {
              const url =  client.items().type(type.system.codename).getUrl();
              return url;
            }
            // by query, read query values from the schema you defined in inputs above and generate a public url to the results
            return '';
          },
        }));
      },
      async getEntriesByResourceType(id: string, options) {
        const query = client.items().type(id);;
        if (options?.resourceEntryId) {
          // data plugins UI is asking for a specific entry return [entry]
          return [];
        } else if (options?.searchText) {
          // data plugins UI is asking for the results of a free form search on entries per resource type
          // hit api with searchText and return an array that matches interface Array<{ name: string, id: string}>
          return [];
        }
        // no search or specific entry , return all entries for  this specific resource type
        const result = await query.toAllPromise();
        return result.data.items.map(entry => ({
          id: entry.system.codename,
          name: entry.system.name as string,
        }));
      },
    };
  }
);
