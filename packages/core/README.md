# Builder Core

## Getting Started

```javascript
import { builder } from '@builder.io/sdk'

builder.init(YOUR_KEY)

builder.setUserAttributes({
  userIsLoggedIn: true,
  whateverKey: 'whatever value'
})

builder.get(YOUR_MODEL_NAME).subscribe(({ data }) => {
  // Do something with the data
})
```

More docs coming soon!

If you have questions or comments don't hesitate to each out by creating an issue or emailing steve@builder.io
