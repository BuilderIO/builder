import { registerDataPlugin } from '@builder.io/data-plugin-tools';
import pkg from '../package.json';

const pluginId = pkg.name;

registerDataPlugin(
  {
    id: pluginId,
    name: 'TODO Add your plugin name',
    // icon: 'TODO add your icon url',
    // Settings is optional and it represents what input you need from the user to connect their data
    settings: [
      // Example of a settings input
      // {
      //   name: 'spaceId',
      //   type: 'string',
      //   required: true,
      //   helperText:
      //     'Get your space ID, from your contentful space settings > API Keys https://www.contentful.com/developers/docs/references/authentication/',
      // },
    ],
    ctaText: ``,
  },
  // settings will be an Observable map of the settings configured above
  async settings => {
    const contentTypes = [{ name: 'test ', id: 'test' }];
    return {
      async getResourceTypes() {
        return contentTypes.map(type => ({
          name: type.name,
          id: type.id,
          canPickEntries: true,
          inputs: () => {
            // return a list of inputs to query your data, think of this as the query schema: limit / offset / specific fields to query against
            return [];
          },
          toUrl: (options: any) => {
            // by entry
            if (options.entry) {
              // return specific entry public URL
              return '';
            }
            // by query, read query values from the schema you defined in inputs above and generate a public url to the results
            return '';
          },
        }));
      },
      async getEntriesByResourceType(id: string, options) {
        if (options?.resourceEntryId) {
          // data plugins UI is asking for a specific entry return [entry]
          return [];
        } else if (options?.searchText) {
          // data plugins UI is asking for the results of a free form search on entries per resource type
          // hit api with searchText and return an array that matches interface Array<{ name: string, id: string}>
          return [];
        }
        // no search or specific entry , return all entries for  this specific resource type
        return [];
      },
    };
  }
);
