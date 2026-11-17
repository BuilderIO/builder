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

If you're investigating Content API traffic or need to correlate a specific SDK call with a
Builder-side request (via the `x-request-id` response header), set `Builder.logLevel` to one of
the standard `console` log levels:

- `'silent'` *(default)* — no HTTP logging
- `'error'` — network/`fetch` rejections and `5xx` responses via `console.error`
- `'warn'` — `'error'` plus `4xx` responses via `console.warn`
- `'info'` — `'warn'` plus a 1-line summary for every HTTP request via `console.info` (method, URL, status, duration, and `x-request-id`)
- `'debug'` — `'info'` plus outgoing request headers and response headers via `console.debug` (sensitive headers like `Authorization` are automatically redacted)

```javascript
import { Builder } from '@builder.io/sdk';

Builder.logLevel = 'info'; // or 'error' | 'warn' | 'debug' | 'silent'
```

Under Node.js, `Builder.logLevel` defaults from the `BUILDER_SDK_LOG_LEVEL` environment variable
(e.g. `BUILDER_SDK_LOG_LEVEL=info` or `BUILDER_SDK_LOG_LEVEL=debug`), so it can be enabled for a
deployment without a code change. In browser/edge environments without `process.env`, it falls
back to `'silent'` and can be set programmatically as shown above.

View all options for `builder.get` [here](./docs/interfaces/GetContentOptions.md)

Learn more about how to use the Builder core SDK:

- [Content API](https://www.builder.io/c/docs/content-api)
- [Querying Cheatsheet](https://www.builder.io/c/docs/querying)
