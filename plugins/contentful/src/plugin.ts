import { registerDataPlugin } from '@builder.io/data-plugin-tools';
import pkg from '../package.json';
import contentful from 'contentful';
// Define Commerce.js plugin ID. ID string should match package name.
const pluginId = pkg.name;

// Commerce.js Builder.io plugin for integrating products, categories and merchant
// data from your Chec store
registerDataPlugin(
  {
    id: pluginId,
    name: 'Contentful',
    icon: 'https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Fd6097cd40fef4b94b18a3e0c4c53584d',
    settings: [
      // List of data input to connect store
      {
        name: 'spaceId',
        type: 'string',
        required: true,
        helperText:
          'TODO',
      },
            // List of data input to connect store
            {
              name: 'accessToken',
              type: 'string',
              required: true,
              helperText:
                'TODO',
            },
    ],
    ctaText: `Connect your Contentful space`,
  },
  // Observable map of the settings configured above
  async settings => {
    // Get public key input from user
    const spaceID = settings.get('spaceId')?.trim();
    const accessToken = settings.get('accessToken')?.trim();
    const client = await contentful.createClient({
      space: spaceID,
      accessToken,
    })
    return {
      async getResourceTypes() {
        const contnetTypes = await client.getContentTypes();
        return contnetTypes.items.map(type => ({
          name: type.name,
          id: type.name,
          canPickEntries: true,
          toUrl: (options: any) => {
            console.log(' here to url ' , options)
            return '';
          }
        }))
      },
      async getEntriesByResourceType(id: string, options) {
        console.log(' here getting resource before for ', id, options);
        const entries = await client.getEntries({
          content_type: id,
          ...(options?.searchText && { query: options?.searchText }),
        }).then(res => res.items);
        console.log(' here getting resource entries for ', id, entries);
        return entries.map(entry => entry.toPlainObject() as any);
      }
    }
  }
);
