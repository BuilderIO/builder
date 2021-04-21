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

// Turn of cookies/tracking
builder.canTrack = false;
```

More docs are coming soon!

If you have questions or comments, don't hesitate to reach out by creating an issue or emailing steve@builder.io
