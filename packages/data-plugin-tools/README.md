# Builder.io Data plugin tools

Easily connect your data resources to your Builder.io content!

<video autoplay="true" muted="true" loop="" class="builder-video css-6heqsi" playsinline="true"><source type="video/mp4" src="https://cdn.builder.io/o/assets%2FYJIGb4i01jvw0SRdL5Bt%2F0f54f2048dfe4eaa86d19066033f6974?alt=media&amp;token=2a9087a0-6988-44ae-899d-ad170d3b73e3&amp;apiKey=YJIGb4i01jvw0SRdL5Bt"></video>

This package main export is `registerDataPlugin`, which will allow you to define what your data API needs (for example: apiToken, password, environment), prompt Builder.io users for those settings, and registers all the resources you define in your plugin.

for real world example check the [@builder.io/plugin-contentful](../../plugins/contentful) folder.

```ts
import { registerDataPlugin } from '@builder.io/data-plugin-tools';

registerCommercePlugin(
  {
    name: 'Foobar',
    id: '@builder.io/plugin-foobar',
    settings: [
      // list of information needed to connect store, optional
      {
        name: 'foo',
        friendlyName: 'Lorem Ipsum',
        type: 'string',
        required: true,
        helperText:
          'Lorem Ipsum',
      }
    ],
    ctaText: `Connect FooBar`,
  },
  /**
   * settings here will be an observable map of the settings you configured above in settings,
   *  ( in this example settings.get('storeId') will give us the storeId entered by user)
   */
  // Observable map of the settings configured above
  async settings => {
    const spaceId = settings.get('spaceId')?.trim();
    return {
      async getResourceTypes() {
        return [
          {
          name: 'Resource 1',
          id: `resource-1`,
          canPickEntries: true,
          // inputs are the query parameter definitions for your public API
          inputs: () => {
            return [
              {
                name: 'include',
                friendlyName: 'Retrieve linked assets level',
                advanced: true,
                defaultValue: 2,
                // contentful api restricts include to be between 0 and 10
                min: 0,
                max: 10,
                type: 'number',
              },
              {
                name: 'limit',
                defaultValue: 10,
                // contentful api restricts limit to be between 0 and 100
                min: 0,
                max: 100,
                type: 'number',
              },

              {
                name: 'order',
                friendlyName: 'Order By'
                type: 'string',
                enum: ['a', 'b']
              },
            ];
          },
          toUrl: (options: any) => {
            // by entry
            // https://cdn.contentful.com/spaces/{space_id}/environments/{environment_id}/entries/{entry_id}?access_token={access_token}
            if (options.entry) {
              return `https://public.example.com/spacs/${spaceId}/resource/${options.entry}`
            }
            // by query
            const params = qs.stringify(options,
              { allowDots: true, skipNulls: true }
            );
            return  `https://public.example.com/spaces/${spaceId}/search?${params}`
            );
          },
          }
        ]
      },
      async getEntriesByResourceType(typeId: string, options) {
        const results = await fetch(`https://public.example.com/spaces/${spaceId}?${qs.stringify(options)}`)
      },
    };
  }
);
```
