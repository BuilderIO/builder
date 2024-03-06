# Builder.io Vue SDK Changelog (@builder.io/sdk-vue)

## 1.0.10

### Patch Changes

- 6dd554f: Update readme with absolute URLs

## 1.0.8

### Patch Changes

- b659b6f: Fix: usage of `Blocks` in custom components not setting `BlocksWrapper` correctly.

## 1.0.6

### Patch Changes

- 9b873cd: Feature: allow passing `search` param (of type `URLSearchParams | string | object`) to `isPreviewing` and `isEditing` helpers. This allows users to rely on this function in SSR environments to determine whether the current request is a preview or edit request.

## 1.0.4

### Patch Changes

- 4528969: move `/edge`, `/node` and `/browser` sub-path exports to `/bundle/edge`, `/bundle/node` and `/bundle/browser`

## 1.0.3

### Patch Changes

- a730741: fix `userAttributes` types in `GetContentOptions`

## 1.0.2

### Patch Changes

- a4bfcbc: Fix: move dynamicRequire of `isolated-vm` outside of global scope to reduce crashes/issues.

## 1.0.0

### Major Changes

- 388c152: - 🧨 Breaking changes: this release removes the following deprecations:

  Exports:

  - `RenderBlocks` -> `Blocks`
  - `RenderContent` -> `Content`
  - `getContent` -> `fetchOneEntry`
  - `getAllContent` -> `fetchEntries`

  Arguments/Props:

  - `Content`'s `includeRefs` prop is removed in favor of `enrich`.
  - `fetchOneEntry`'s `includeRefs` and `noTraverse` arguments are removed in favor of `enrich`.

  Functionality:

  - removed deprecated side-effect `registerComponent()`. Instead, use the `customComponents` prop of `Content`.

## 0.13.4

### Patch Changes

- 3764321: Fix: replace broken default value of Video Block with a working link.

## 0.13.3

### Patch Changes

- f67242f: types: add `meta` property to Input

## 0.13.2

### Patch Changes

- cdc5ce8: Feature: Add Form, FormSelect, FormSubmit and FormInput blocks.

## 0.13.1

## 0.13.0

### Minor Changes

- da5d871: 🧨 Breaking Change: remove 'v2' as a viable `apiVersion`. Only 'v3' is now allowed.

### Patch Changes

- 2b67586: Fix: TypeScript types for all exports.

## 0.12.8

### Patch Changes

- 6b32014: Add `subscribeToEditor()` export that allows listening to content changes. Helpful for previewing data models.

## 0.12.7

### Patch Changes

- cbc49e4: Feature: add Animations support

## 0.12.6

## 0.12.5

### Patch Changes

- e7f6db6: Fix: sigfault crash when using SDK in Node v20 + M1 Macs. Skip usage of `isolated-vm` in those environments.

## 0.12.4

### Patch Changes

- fdb6416: Feature: added `linkComponent` prop to provide a custom component for links.

  This applies to:

  - the Button component when provided a link
  - the "Link URL" field for any block
  - the "Link" field for a column within the Columns block.

## 0.12.3

### Patch Changes

- 8b970b4: Fix: issue with Button `all: 'unset'` overriding all other styles.

## 0.12.2

### Patch Changes

- fa616c9: Added a `trustedHosts` prop to `Content`. It is used to determine whether the SDK can enable editing/previewing mode within a host. Also added stricter default checking of trusted hosts.
- 286f80d: Fix: class attributes now correctly being passed down

## 0.12.1

### Patch Changes

- 9b71eab: Feature: added support for the Builder `Slot` block

## 0.11.5

### Patch Changes

- 9a631fa: Fix: update "/edge" and "/node" subpath exports to only point to their corresponding bundles. This guarantees that the browser bundle is never imported by mistake.

## 0.11.4

### Patch Changes

- 80cf984: Fix: react to changes in `props.data`

## 0.11.3

### Patch Changes

- 538d559: Add './edge' subpath export to work around isolated-vm issues in serverless environments.
- 538d559: Fix: use correct export for ContentProps
- 538d559: Export prop types of all exported components in main index file.
- 538d559: Improve documentation of `ContentProps` types.

## 0.11.2

### Patch Changes

- 2821f68: Fix CSS imports:

  - add a `/nuxt` subpath export for a Nuxt module. Currently, it handles importing CSS, and is used like so:

  ```ts
  // nuxt.config.js
  export default defineNuxtConfig({
    modules: ['@builder.io/sdk-vue/nuxt'],
  });
  ```

  - bring back `/css` subpath export. This is used internally by the Nuxt module, but also allows more flexibility for customers to import CSS as they see fit.
  - remove CSS imports from server bundles, as they cause errors due to invalid extensions.
  - add `sideEffects` array to package.json for webpack.

## 0.11.1

### Patch Changes

- 9544220: Fix: duplicate attributes getting applied to both the block and its wrapper element.

## 0.11.0

### Minor Changes

- 70fa50d: - 🧨 Breaking: removed Vue 2 SDK

  - 🧨 Breaking: removed `@builder.io/sdk-vue/vue3` import. To import the SDK, you should now use:

  ```ts
  // BEFORE
  import { Content } from '@builder.io/sdk-vue/vue3';

  // AFTER
  import { Content } from '@builder.io/sdk-vue';
  ```

## 0.10.0

### Minor Changes

- 39149d5: 🧨 Breaking: `fetchAllEntries`/`getAllContent` now returns the array of contents directly, instead of an object with a `results` property.

## 0.9.0

### Minor Changes

- 435c5ee: Breaking: Now that Vue 2 has reached EOL, the Vue 2 SDK is no longer actively tested nor maintained.

  See https://v2.vuejs.org/lts/ for EOL announcement.

### Patch Changes

- 435c5ee: Feature: add `contentWrapper`, `contentWrapperProps`, `blocksWrapper`, `blocksWrapperProps` props to Content:

  ```ts
  {
   /**
     * The element that wraps your content. Defaults to `div` ('ScrollView' in React Native).
     */
    contentWrapper?: any;
    /**
     * Additonal props to pass to `contentWrapper`. Defaults to `{}`.
     */
    contentWrapperProps?: any;
    /**
     * The element that wraps your blocks. Defaults to `div` ('ScrollView' in React Native).
     */
    blocksWrapper?: any;
    /**
     * Additonal props to pass to `blocksWrapper`. Defaults to `{}`.
     */
    blocksWrapperProps?: any;
  }
  ```

## 0.8.1

## 0.8.0

### Minor Changes

- 792ffaf: Fix: remove the need for users to manually import CSS stylesheet.
- 🧨 Breaking Changes: remove the CSS stylesheet exports:
  - `import '@builder.io/sdk-vue/css'`
  - `import '@builder.io/sdk-vue/vue2/css'`
  - `import '@builder.io/sdk-vue/vue3/css'`
    If you were using these, all you have to do is remove the import, since the import was moved to the SDK internals.

## 0.7.6

## 0.7.5

### Patch Changes

- ddb31e4: Fix: setting default input values
- ddb31e4: Fix: collection repetition bug for empty/undefined lists

## 0.7.4

### Patch Changes

- 5500600: Multiples fixes to SSR A/B testing logic
- d3c613d: Fix: Video block styles (aspect ratio, fitContent, etc.).
  Fix: Allow Video block to render children components.
- 5500600: Fix: Stringify inlined SSR A/B test scripts at build-time. Avoids mismatches caused by run-time stringification.

## 0.7.3

## 0.7.2

### Patch Changes

- da956c3: Fix publishing configuration

## 0.7.1

### Patch Changes

- f7e1a5e: Chore: added changesets workflow to automate changelogs and release process
- 89e5965: add `isolated-vm` package to sandbox VM code when running in Node environments

## 0.7.0

- Setting `noTraverse` option's default to `true` when fetching multiple content entries.

## 0.6.4

- No Change.

## 0.6.3

- Fix issue with block styles not updating when editing them.

## 0.6.2

- No Changes.

## 0.6.1

- Fix npm publishing configuration to include new bundling output.

## 0.6.0

- Update build pipeline to generate 3 separate bundles for each environment: browser, node and edge runtimes.
- Make the default import (`import Sdk from '@builder.io/sdk-vue'`) point to `vue3` sub-export instead of `vue2`.

## 0.5.9

No Changes.

## 0.5.8

- Fix: properly serialize messages sent to visual editor.

## 0.5.7

- No Changes.

## 0.5.6

- No Changes.

## 0.5.5

- Fix: remove `lru-cache` import and usage.

## 0.5.4

- Fix build issues caused by extraneous `acorn` import.
- Put Edge runtime evaluator behind dynamic import.

## 0.5.2

- No Changes.

## 0.5.1

- Fix: make `RenderBlocks` properties `context` and `registeredComponents` optional for external use.

## 0.5.0

- Feature: Added support for rudimentary data-bindings in Non-Node.js (edge, serverless, etc.) server runtimes.

## 0.4.5

- Fix: show dynamic symbols correctly in Preview mode.
- Feature: SSR A/B test Symbols nested inside page content.
- Fix: inlined scripts and styles not rendering in SSR.
- Fix: Hydration mismatch when using SSR A/B tests.

## 0.4.4

- Fix: tracking URL from `builder.io/api/v1/track` to `cdn.builder.io/api/v1/track` for improved reliability.

## 0.4.3

- Fix: SSR A/B test environment check (`isHydrationTarget`) now accurately checks current environment.
- Fix: Stop using `defineAsyncComponent` to import SDK components (except those absolutely necessary to avoid circular dependencies, `RenderComponent` and `RenderRepeatedBlock`). This fixes an issue with A/B test inline styles not updating properly.

## 0.4.2

- No external changes.

## 0.4.1

- Fix: bring back `getBuilderSearchParams` export that was accidentally removed.

## 0.4.0

- Feature: A/B tests are now rendered correctly during server-side rendering (SSR) when applicable. This behaviour is backwards compatible with previous versions.
- Fix: memory leak caused by passing reactive component references.
- Feature: Add support for `enrich` API flag.
- Mark `noTraverse` and `includeRefs` as deprecated.- Fix: memory leak caused by passing reactive component references.

## 0.3.1

- Feature: Added SDK version to data sent to visual editor for improved debugging.
- Fix: Columns block: removed redundant margin-left in first column.
- Fix: dynamic action bindings in repeated data. (Vue 3 SDK only)

## 0.3.0

- No Changes.

## 0.2.3

- No Changes.

## 0.2.2

- Fix: dynamic bindings for Link URLs.
- Fix: previewing content that includes a symbol whose `model` property is a `page`.
- Fix: "Show If"/"Hide If" bindings when the initial value is `undefined`.

## 0.2.1

- No Changes.

## 0.2.0

- Sets the default `apiVersion` to `v3`.

In case you feel the need to use our older API Version `v2`, reach out to us at support@builder.io first. But you can override the default by setting `apiVersion` explicitly to `v2` as follows:

```jsx
<RenderContent apiVersion="v2" />
```

```js
getContent({ apiVersion: 'v2' });
```

More details on the Builder API Versions visit [this link](https://www.builder.io/c/docs/content-api-versions).

## 0.1.16

- No changes.

## 0.1.15

- No changes.

## 0.1.14

- No changes.

## 0.1.13

- Fix: Columns block styling & `stackColumnsAt` prop

## 0.1.12

- Fix: `RenderContent` not re-rendering when its `content` updates. This fixes Symbol rendering in the visual editor.
- Feature: `RenderContent` and `getContent` now have an `apiVersion` field that can be set to `v2` or `v3` to target specific Builder API versions. Current default is `v2`

## 0.1.11

- No changes.

## 0.1.10

- Fix: Text blocks styles (remove initial top padding)

## 0.1.9

- No changes.

## 0.1.8

- Added support for "Show If" & "Hide If" dynamic bindings to elements.

## 0.1.7

- Fixed binding of element events https://github.com/BuilderIO/builder/pull/1767

## 0.1.6

- Types: removed redundant `builtIn` field in `customComponents` prop types

## 0.1.5

- Feature: support mutating Builder's `state` in custom element events and custom user code.
- Feature: Global CSS Nesting (`&` operator) support

## 0.1.4

No Changes.

## 0.1.3

- Support Heatmaps
- Support Insights data filtering by URL & Device

## 0.1.2

- Fix: respect when `canTrack` is set to `false`
- Fix: issues sending session and visitor IDs with tracking events

## 0.1.1

🧨 Breaking change: we no longer provide a `node-fetch` polyfill. See [the docs](./README.md#fetch) for more information.

## 0.0.1-56

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

## 0.0.1-54

🐛 Fix: custom components were not rendering correctly
🐛 Fix: Image component's `srcSet` was not being set correctly

## 0.0.1-52

🧨 Breaking change: the format of the `customComponents` prop has changed from `[{ component, info }]` to `[{ component, ...info }]`.
See [builder-registered-components.ts](/packages/sdks/src/constants/builder-registered-components.ts) for examples of how to do so, or see the example provided for this SDK.

## 0.0.1-51

⚠️ Deprecation notice: Registering components via `registerComponent(component, info)` is now deprecated.
To register your custom components in Builder, you must now provide a `customComponents` array to the `RenderContent` component containing `[{ component, info }]`.
See [builder-registered-components.ts](/packages/sdks/src/constants/builder-registered-components.ts) for examples of how to do so, or see the example provided for this SDK.

## 0.0.1-50

- feat: 🎸 export `isPreviewing()` (https://github.com/BuilderIO/builder/pull/951)
- feat: 🎸 Add support for Symbols (https://github.com/BuilderIO/builder/pull/951)
- feat: 🎸 Add support for Data Bindings https://github.com/BuilderIO/builder/pull/970

- BREAKING CHANGE: 🧨 RenderContent must now be provided the `apiKey` as a prop (https://github.com/BuilderIO/builder/pull/951)

## 0.0.1-49

- Fix: show the "+ add block" button on empty pages https://github.com/BuilderIO/builder/pull/934
- Add `getBuilderSearchParams` helper export to easily view current drafts on your production site. https://github.com/BuilderIO/builder/pull/883

## 0.0.1-48

Changes:

- Adds support for Columns https://github.com/BuilderIO/builder/pull/717
- Add preliminary support for Children within custom components https://github.com/BuilderIO/builder/pull/753
- Seeds classnames to reduce variation in changes https://github.com/BuilderIO/builder/pull/703
- Fixes `getAllContent` to traverse all symbols/references https://github.com/BuilderIO/builder/pull/718
