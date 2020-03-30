# Builder.io React SDK

See our [main readme](/README.md) for info on getting starte with the React SDK

Also see our examples of using reacth with a [design system](/examples/react-design-system) or a [simple example](/examples/react) and how to use your [react components](https://github.com/BuilderIO/builder#using-your-components) in the visual editor!

Also see our docs for [next.js](/examples/next-js) and [gatsby](/examples/gatsby)

## React API

### builder

The React SDK exports the core SDK's [builder object](../core), which can be used for settings like 
your API key and user attributes

```javascript
import { builder } from '@builder.io/sdk'

builder.init(YOUR_KEY)

// Optional custom targeting
builder.setUserAttributes({
  userIsLoggedIn: true,
  whateverKey: 'whatever value'
})

builder.get(YOUR_MODEL_NAME, {
  // Optional custom query
  query: {
    'data.customField.$gt': 100
  }
}).promise().then(({ data }) => {
  // Do something with the data
})
```