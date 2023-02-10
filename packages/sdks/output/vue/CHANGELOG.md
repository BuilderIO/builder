### 0.1.9

- No changes.

### 0.1.8

- Added support for "Show If" & "Hide If" dynamic bindings to elements.

### 0.1.7

- Fixed binding of element events https://github.com/BuilderIO/builder/pull/1767

### 0.1.6

- Types: removed redundant `builtIn` field in `customComponents` prop types

### 0.1.5

- Feature: support mutating Builder's `state` in custom element events and custom user code.
- Feature: Global CSS Nesting (`&` operator) support

### 0.1.4

No Changes.

### 0.1.3

- Support Heatmaps
- Support Insights data filtering by URL & Device

### 0.1.2

- Fix: respect when `canTrack` is set to `false`
- Fix: issues sending session and visitor IDs with tracking events

### 0.1.1

🧨 Breaking change: we no longer provide a `node-fetch` polyfill. See [the docs](./README.md#fetch) for more information.

### 0.0.1-56

- Feature: We now provide initial support for Vue 3.

🧨 Breaking change: you must now explicitly import the Vue SDK version that you want (for Vue 2 or Vue 3) e.g.

```ts
// imports Vue 2 SDK
import * as BuilderSDK from '@builder.io/sdk-vue/vue2';
// fallback to Vue 2 SDK
import * as BuilderSDK from '@builder.io/sdk-vue';

// imports Vue 3 SDK
import * as BuilderSDK from '@builder.io/sdk-vue/vue3';
```

### 0.0.1-54

🐛 Fix: custom components were not rendering correctly
🐛 Fix: Image component's `srcSet` was not being set correctly

### 0.0.1-52

🧨 Breaking change: the format of the `customComponents` prop has changed from `[{ component, info }]` to `[{ component, ...info }]`.
See [builder-registered-components.ts](/packages/sdks/src/constants/builder-registered-components.ts) for examples of how to do so, or see the example provided for this SDK.

### 0.0.1-51

⚠️ Deprecation notice: Registering components via `registerComponent(component, info)` is now deprecated.
To register your custom components in Builder, you must now provide a `customComponents` array to the `RenderContent` component containing `[{ component, info }]`.
See [builder-registered-components.ts](/packages/sdks/src/constants/builder-registered-components.ts) for examples of how to do so, or see the example provided for this SDK.

### 0.0.1-50

- feat: 🎸 export `isPreviewing()` (https://github.com/BuilderIO/builder/pull/951)
- feat: 🎸 Add support for Symbols (https://github.com/BuilderIO/builder/pull/951)
- feat: 🎸 Add support for Data Bindings https://github.com/BuilderIO/builder/pull/970

- BREAKING CHANGE: 🧨 RenderContent must now be provided the `apiKey` as a prop (https://github.com/BuilderIO/builder/pull/951)

### 0.0.1-49

- Fix: show the "+ add block" button on empty pages https://github.com/BuilderIO/builder/pull/934
- Add `getBuilderSearchParams` helper export to easily view current drafts on your production site. https://github.com/BuilderIO/builder/pull/883

### 0.0.1-48

Changes:

- Adds support for Columns https://github.com/BuilderIO/builder/pull/717
- Add preliminary support for Children within custom components https://github.com/BuilderIO/builder/pull/753
- Seeds classnames to reduce variation in changes https://github.com/BuilderIO/builder/pull/703
- Fixes `getAllContent` to traverse all symbols/references https://github.com/BuilderIO/builder/pull/718
