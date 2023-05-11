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

View all options for `builder.get` [here](./docs/interfaces/GetContentOptions.md)

Learn more about how to use the Builder core SDK:
- [Content API](https://www.builder.io/c/docs/content-api)
- [Querying Cheatsheet](https://www.builder.io/c/docs/querying)
