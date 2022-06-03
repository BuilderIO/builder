# Builder.io Vue SDK

Builder.io drag and drop page and section building for Vue.

NOTE: If you are looking for the _beta_ 2.0 Vue SDK, you can find it [here](/packages/sdks/output/vue)


## Integration

See our full [getting started docs](https://www.builder.io/c/docs/developers), or jump right into integration. We generally recommend to start with page buliding as your initial integration:

<table>
  <tr>
    <td align="center">Integrate Page Building</td>
    <td align="center">Integrate Section Building</td>
    <td align="center">Integrate CMS Data</td>
  </tr>
  <tr>
    <td align="center">
      <a href="https://www.builder.io/c/docs/integrating-builder-pages?codeFramework=vue">
        <img alt="CTA to integrate page buliding" src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F48bbb0ef5efb4d19a95a3f09f83c98f0" />
      </a>
    </td>
    <td align="center">
      <a href="https://www.builder.io/c/docs/integrate-section-building?codeFramework=vue">
        <img alt="CTA to integrate section buliding" src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F9db93cd1a29443fca7b67c1f9f458356" />
      </a>
    </td>    
    <td align="center">
      <a href="https://www.builder.io/c/docs/integrate-cms-data?codeFramework=vue">
        <img alt="CTA to integrate CMS data" src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F8df098759b0a4c89b8c25edec1f3c9eb" />
      </a>
    </td>        
  </tr>
</table>

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

Take a look at this in practice in an example you can run with our [Nuxt](/examples/vue/nuxt-2-old-sdk/) example

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
