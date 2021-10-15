# Builder.io Admin API SDK.

Nodejs SDK to interact with Builder.io Graphql Admin API (beta).

## How to use

- Install using your favorite package manager:

```
npm install @builder.io/admin-sdk
```

- get a private key of the space you want to administer `bpk-xxx`

```typescript
import { createAdminApiClient } from '@builder.io/admin-sdk';
const adminSDK = createAdminApiClient(process.env.BUILDER_PRIVATE_KEY);

// example getting space settings:
const res = await adminSDK.query({
  settings: true,
});

// example getting all models fields on a space:
const res = await adminSDK.query({
  models: {
    id: true,
    fields: true,
  },
});

// example creating a model from admin api
await adminSDK.chain.mutation
  .addModel({
    body: {
      defaultQuery: [],
      kind: 'component',
      showTargeting: true,
      allowHeatmap: true,
      id: 'xxxxxx',
      showMetrics: true,
      publicReadable: true,
      name: 'announcement-bar',
      useQueryParamTargetingClientSide: false,
      fields: [
        {
          type: 'uiBlocks',
          '@type': '@builder.io/core:Field',
          required: true,
          hideFromFieldsEditor: true,
          name: 'blocks',
          showTemplatePicker: true,
        },
      ],
      helperText: 'This model is for announcement bars',
      allowBuiltInComponents: true,
      bigData: false,
      strictPrivateWrite: false,
      requiredTargets: [],
      schema: {},
      examplePageUrl: 'https://my.site.com/preview',
      webhooks: [],
      apiGenerated: true,
      showScheduling: true,
      showAbTests: true,
      pathPrefix: '/',
      componentsOnlyMode: false,
    },
  })
  .execute({});
```

## More info:

- check the graphiql explorer on [beta.builder.io/api/v2/admin](https://beta.builder.io/api/v2/admin), add your private key to the http headers section and inspect available queries / mutations:

 <p align="center">
  <img alt="BUILDER" src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F281068da62e44bb5bce7d48307cec9f0"  />
</p>
