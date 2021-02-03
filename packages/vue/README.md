# Builder.io Vue SDK

Builder.io drag and drop page and section building for Vue

## Get started

```bash
npm install @builder.io/vue
```

## Usage

```vue
<template>
  <RenderContent model="page" />
</template>

<script>
import { builder, RenderContent } from '@builder.io/vue'
import Vue from 'vue'

// TODO: enter your public API key
builder.init('jdGaMusrVpYgdcAnAtgn')

export default Vue.extend({
  components: { RenderContent },
})
</script>
```

## Example

Take a look at this in practice in an example you can run with our [Nuxt](../examples/nuxt) example