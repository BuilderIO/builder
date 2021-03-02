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
import { builder, RenderContent } from '@builder.io/vue';
import Vue from 'vue';

// Enter your Builder.io public API key
builder.init(YOUR_KEY);

export default Vue.extend({
  components: { RenderContent },
});
</script>
```

## Example

Take a look at this in practice in an example you can run with our [Nuxt](../../examples/nuxt) example

## Options

The `RenderComponent` component also takes additional options and emits events when content loads or errors

```vue
<template>
  <RenderContent
    model="page"
    @contentLoaded="contentLoaded"
    @contentError="contentError"
    :options="{
      // optional - define the URL to pull content for
      // in browseres this is grabbed automatically from location.href for pages
      // and content targeted to specific URLs
      url: $route.path,
      // optional - filter content on custom fields
      query: {
        data: {
          myCustomField: 'myCustomValue',
        },
      },
    }"
  />
</template>

<script>
import { builder, RenderContent } from '@builder.io/vue';
import Vue from 'vue';

// Enter your Builder.io public API key
builder.init(YOUR_KEY);

// Optional - Set attributes to target content off of
// https://www.builder.io/c/docs/guides/targeting-and-scheduling
builder.setUserAttributes({
  locale: 'en_us',
});

export default Vue.extend({
  components: { RenderContent },
  data: () => ({
    notFound: false,
  }),
  methods: {
    contentLoaded(content) {
      if (!content) {
        this.notFound = true;
      }
    },
    contentError(err) {
      // Handle error
    },
  },
});
</script>
```
