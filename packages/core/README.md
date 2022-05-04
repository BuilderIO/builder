# Builder Core

## Getting Started

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
  .promise()
  .then(({ data }) => {
    // Do something with the data
  });

// Turn of cookies/tracking
builder.canTrack = false;
```

If you have questions or comments, don't hesitate to reach out by creating an issue or emailing steve@builder.io
