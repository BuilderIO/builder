### 0.7.0

- Setting `noTraverse` option's default to `true` when fetching multiple content entries.

### 0.6.4

- No Change.

### 0.6.3

- Fix issue with block styles not updating when editing them.

### 0.6.2

- No Changes.

### 0.6.1

- Fix npm publishing configuration to include new bundling output.

### 0.6.0

- Update build pipeline to generate 3 separate bundles for each environment: browser, node and edge runtimes.
- Make the default import (`import Sdk from '@builder.io/sdk-vue'`) point to `vue3` sub-export instead of `vue2`.

### 0.5.9

No Changes.

### 0.5.8

- Fix: properly serialize messages sent to visual editor.

### 0.5.7

- No Changes.

### 0.5.6

- No Changes.

### 0.5.5

- Fix: remove `lru-cache` import and usage.

### 0.5.4

- Fix build issues caused by extraneous `acorn` import.
- Put Edge runtime evaluator behind dynamic import.

### 0.5.2

- No Changes.

### 0.5.1

- Fix: make `RenderBlocks` properties `context` and `registeredComponents` optional for external use.

### 0.5.0

- Feature: Added support for rudimentary data-bindings in Non-Node.js (edge, serverless, etc.) server runtimes.

### 0.4.5

- Fix: show dynamic symbols correctly in Preview mode.
- Feature: SSR A/B test Symbols nested inside page content.
- Fix: inlined scripts and styles not rendering in SSR.
- Fix: Hydration mismatch when using SSR A/B tests.

### 0.4.4

- Fix: tracking URL from `builder.io/api/v1/track` to `cdn.builder.io/api/v1/track` for improved reliability.

### 0.4.3

- Fix: SSR A/B test environment check (`isHydrationTarget`) now accurately checks current environment.
- Fix: Stop using `defineAsyncComponent` to import SDK components (except those absolutely necessary to avoid circular dependencies, `RenderComponent` and `RenderRepeatedBlock`). This fixes an issue with A/B test inline styles not updating properly.

### 0.4.2

- No external changes.

### 0.4.1

- Fix: bring back `getBuilderSearchParams` export that was accidentally removed.

### 0.4.0

- Feature: A/B tests are now rendered correctly during server-side rendering (SSR) when applicable. This behaviour is backwards compatible with previous versions.
- Fix: memory leak caused by passing reactive component references.
- Feature: Add support for `enrich` API flag.
- Mark `noTraverse` and `includeRefs` as deprecated.- Fix: memory leak caused by passing reactive component references.

### 0.3.1

- Feature: Added SDK version to data sent to visual editor for improved debugging.
- Fix: Columns block: removed redundant margin-left in first column.
- Fix: dynamic action bindings in repeated data. (Vue 3 SDK only)

### 0.3.0

- No Changes.

### 0.2.3

- No Changes.

### 0.2.2

- Fix: dynamic bindings for Link URLs.
- Fix: previewing content that includes a symbol whose `model` property is a `page`.
- Fix: "Show If"/"Hide If" bindings when the initial value is `undefined`.

### 0.2.1

- No Changes.

### 0.2.0

- Sets the default `apiVersion` to `v3`.

In case you feel the need to use our older API Version `v2`, reach out to us at support@builder.io first. But you can override the default by setting `apiVersion` explicitly to `v2` as follows:

```jsx
<RenderContent apiVersion="v2" />
```

```js
getContent({ apiVersion: 'v2' });
```

More details on the Builder API Versions visit [this link](https://www.builder.io/c/docs/content-api-versions).

### 0.1.16

- No changes.

### 0.1.15

- No changes.

### 0.1.14

- No changes.

### 0.1.13

- Fix: Columns block styling & `stackColumnsAt` prop

### 0.1.12

- Fix: `RenderContent` not re-rendering when its `content` updates. This fixes Symbol rendering in the visual editor.
- Feature: `RenderContent` and `getContent` now have an `apiVersion` field that can be set to `v2` or `v3` to target specific Builder API versions. Current default is `v2`

### 0.1.11

- No changes.

### 0.1.10

- Fix: Text blocks styles (remove initial top padding)

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
