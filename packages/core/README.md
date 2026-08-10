# Builder Core SDK

This SDK is largely a wrapper over our [Content API](https://www.builder.io/c/docs/content-api)

```javascript
import { builder } from '@builder.io/sdk';

builder.init(YOUR_KEY);

// Optional custom targeting
builder.setUserAttributes({
  userIsLoggedIn: true,
  whateverKey: 'whatever value',
});

builder
  .get(YOUR_MODEL_NAME, {
    // Optional custom query
    query: {
      'data.customField.$gt': 100,
    },
  })
  .promise()
  .then(({ data }) => {
    // Do something with the data
  });

// The options that you can send to builder.get and builder.getAll
// are defined here: https://forum.builder.io/t/what-are-the-options-for-the-methods-builder-get-and-builder-getall/1036
builder
  .getAll(YOUR_MODEL_NAME, {
    limit: 10,
  })
  .then(results => {
    // Do something with the results
  });

// Turn of cookies/tracking
builder.canTrack = false;
```

## Debugging Content API requests

If you're seeing intermittent issues with Content API responses and need to report them to
Builder.io support, you can opt in to request/response logging so you can correlate a specific
SDK call with a request on Builder's side (via the `x-request-id` response header):

```javascript
import { Builder } from '@builder.io/sdk';

// Logs the request URL, method, response status, and x-request-id header
// (when present) for every content fetch via console.debug.
Builder.logLevel = 'debug';
```

Under Node.js, `Builder.logLevel` defaults from the `BUILDER_SDK_LOG_LEVEL` environment variable
(e.g. `BUILDER_SDK_LOG_LEVEL=debug`), so it can be turned on for a deployment without a code
change. In browser/edge environments without `process.env`, it falls back to `'silent'` and can
only be set programmatically as shown above. This setting defaults to `'silent'` and is a no-op
unless explicitly enabled.

View all options for `builder.get` [here](./docs/interfaces/GetContentOptions.md)

Learn more about how to use the Builder core SDK:

- [Content API](https://www.builder.io/c/docs/content-api)
- [Querying Cheatsheet](https://www.builder.io/c/docs/querying)
