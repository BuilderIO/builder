# Builder Widgets

Adds widgets for Builder.io editing, such as carousels, tabs, accordions, etc.

## How to use it

First, install the package

```bash
npm install @builder.io/widgets
```

When using the React SDK, just

```ts
import '@builder.io/widgets';
```

Anywhere that you render a `<BuilderComponent ... />`, and now the widgets will register and be available in the editor and when rendering (including server side)

## Example

See here for a real [working example in our next.js example repo](/examples/next-js/pages/[...slug].js)

## Lazy Loading

You can also lazy load these components. To do so, instead of importing the root `@builder.io/widgets` which synchronously registers all components, you can insteda register them with your lazy loading library of choice, and these components will only load when used in content, as needed.

Here is an example with Next.js

```ts
import { Builder } from '@builder.io/react';
import { accordionConfig } from '@builder.io/widgets/dist/lib/components/Accordion.config';
import dynamic from 'next/dynamic';

Builder.registerComponent(
  dynamic(() =>
    import('@builder.io/widgets/dist/lib/components/Accordion').then(mod => mod.AccordionComponent)
  ),
  accordionConfig
);
```

You can also use this same methodology with [Loadable](https://github.com/jamiebuilds/react-loadable) or [Suspense](https://reactjs.org/docs/concurrent-mode-suspense.html) as well.

## Help and troubleshooting

Questions or feedback - contact us at help@builder.io, we are happy to help!
