# Builder Widgets

Adds widgets for Builder.io editing, such as carousels, tabs, accordions, etc.

## How to use it

First, install the package:

```bash
npm install @builder.io/widgets
```

When using the React SDK, import:

```ts
import '@builder.io/widgets';
```

When you import widgets wherever you render a `<BuilderComponent ... />`, the widgets register and are available in the Visual Editor and when rendering (including server-side).

## Example

For a working example, check out [Builder's Next.js example](/examples/next-js-simple/pages/%5B%5B...page%5D%5D.tsx).

## Lazy Loading

Instead of importing the root `@builder.io/widgets`, which synchronously registers all components, you can asynchronously import only the widgets used in your Builder content.

### With Next.js

To dynamically import widgets in Next.js, use the following import statement:

```
import '@builder.io/widgets/dist/lib/builder-widgets-async'
```

### Frameworks other than Next.js

Lazy load the widget components explicitly by registering them with your lazy loading library of choice; for example, [Loadable](https://github.com/jamiebuilds/react-loadable), and only the specified components will load when used in content, as needed.

```ts
import { Builder } from '@builder.io/react';
import { accordionConfig } from '@builder.io/widgets/dist/lib/components/Accordion.config';
import loadable from '@loadable/component';

Builder.registerComponent(
  loadable(() =>
    import('@builder.io/widgets/dist/lib/components/Accordion').then(mod => mod.AccordionComponent)
  ),
  accordionConfig
);
```

You can also use this same methodology with [Suspense](https://react.dev/reference/react/Suspense) as well.

## More information

For more detail, read the official Builder widgets documentation, [Using Widgets](https://www.builder.io/c/docs/widgets).

## Help and troubleshooting

If you have questions or feedback, contact us at <support@builder.io>. We are happy to help!
