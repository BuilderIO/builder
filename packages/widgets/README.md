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

See here for a real [working example in our next.js example repo](/examples/next-js-simple/pages/%5B%5B...page%5D%5D.tsx)

## Lazy Loading
Instead of importing the root `@builder.io/widgets` which synchronously registers all components, you can asynchrnously import only the widgets used in builder content:

#### With Next.js
To only dynamically import widgets in next.js:
```
import '@builder.io/widgets/dist/lib/builder-widgets-async'
```

#### Other Frameworks
You'd want to lazy load the widget components explicitly. To do so, , you can register them with your lazy loading library of choice, for e.g  [Loadable](https://github.com/jamiebuilds/react-loadable), and these components will only load when used in content, as needed.

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

You can also use this same methodology with [Suspense](https://reactjs.org/docs/concurrent-mode-suspense.html) as well.

## Help and troubleshooting

Questions or feedback - contact us at help@builder.io, we are happy to help!
