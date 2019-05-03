# Builder Core

## Getting Started

```javascript
import { builder } from '@builder.io/sdk'

builder.init(YOUR_KEY)

builder.get(YOUR_MODEL_NAME).subscribe(({ data }) => {
  // Do something with the data
})
```
