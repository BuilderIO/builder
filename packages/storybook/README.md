# @builder.io/storybook

Addon for integrating [Builder.io](https://www.builder.io) to allow drag and drop page building inside storybook.

## Try it live

[Play around with our Storybook embedded editor example](https://builder-storybook.firebaseapp.com/) refer to our [design systems example](/examples/react-design-system) for lots of examples using your deisgn system + custom components + storybook.

<a target="_blank" href="https://builder-storybook.firebaseapp.com/">
<img src="https://user-images.githubusercontent.com/5093430/76154244-ebbe6480-608d-11ea-9dc9-08a59eda220e.gif" alt="example" />
</a>

## Install

`npm install @builder.io/storybook`

## How to use

Make a free account over at [Builder.io](https://www.builder.io/) and grab your public API key from your [organization page](https://builder.io/account/organization)

## Using your components in the editor

See this [design systems example](/examples/react-design-system) for lots of examples using your deisgn system + custom components + storybook

👉**Tip: want to limit page building to only your components? Try [components only mode](https://builder.io/c/docs/guides/components-only-mode)**

Register a component

```tsx
import { Builder } from '@builder.io/react';

class SimpleText extends React.Component {
  render() {
    return <h1>{this.props.text}</h1>;
  }
}

Builder.registerComponent(SimpleText, {
  name: 'Simple Text',
  inputs: [{ name: 'text', type: 'string' }],
});
```

in `.storybook/preview.js`
Add `builderDecorator` as a global decorator for your storybook and pass `BuilderComponent` as a parameter

```tsx
import { addParameters, addDecorator } from '@storybook/react';
import { BuilderComponent } from '@builder.io/react';
import { builderDecorator } from '@builder.io/storybook';
// builder-settings is where you configure your builder instance: init with api key, add custom menus ..
import '../src/builder-settings';

// add global decorator
addDecorator(builderDecorator);

// pass preview component
addParameters({
  builder: {
    component: BuilderComponent,
  },
});
```

### Mixed Content errors when hosting on insecure http

Our embedded editor is on https and it'll try to load your current setup from your localhost, which when served on `http` will be blocked by the browser, you can fix this by serving storybook on https (ie. `start-storybook -p 9009 -s public --https --ssl-cert [path-to.crt] -ssl-key [path-to.key]`)

Or As a workaround, on Chrome you can allow insecure content on localhost, by toggling the `insecure content` option here [chrome://settings/content/siteDetails?site=http%3A%2F%2Flocalhost%3A9009](chrome://settings/content/siteDetails?site=http%3A%2F%2Flocalhost%3A9009)

## Learn more

- [Design system example](/examples/react-design-system)
- [Official docs](https://www.builder.io/c/docs/getting-started)
