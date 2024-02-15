# Builder.io React Native SDK Changelog (@builder.io/sdk-react-native)

## 1.0.2

### Patch Changes

- a4bfcbc: Fix: move dynamicRequire of `isolated-vm` outside of global scope to reduce crashes/issues.

## 1.0.1

### Patch Changes

- 3a0f26f: fix: replace 'a', 'div' and 'button' with BaseText/View components.
- 3a0f26f: fix: image width/height styles
- 3a0f26f: Fix: crash due to undefined style values

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

## 0.13.1

### Patch Changes

- f1fa6c8: Feature: add TypeScript types.
- f1fa6c8: Fix: Columns `flexGrow` type.

## 0.13.0

### Minor Changes

- da5d871: 🧨 Breaking Change: remove 'v2' as a viable `apiVersion`. Only 'v3' is now allowed.

## 0.12.8

### Patch Changes

- 6b32014: Add `subscribeToEditor()` export that allows listening to content changes. Helpful for previewing data models.

## 0.12.7

## 0.12.6

### Patch Changes

- 8cc0cb8: Fix: rendering falsy strings in Text block (`false`, `0`, etc.)
- 8cc0cb8: Fix: updates to deeply nested Builder `state` value now propagate across content.

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

## 0.12.1

### Patch Changes

- 9b71eab: Feature: added support for the Builder `Slot` block

## 0.11.5

## 0.11.4

### Patch Changes

- 80cf984: Fix: react to changes in `props.data`

## 0.11.3

### Patch Changes

- 538d559: Fix: use correct export for ContentProps
- 538d559: Export prop types of all exported components in main index file.
- 538d559: Improve documentation of `ContentProps` types.

## 0.11.2

## 0.11.1

### Patch Changes

- 9544220: Fix: duplicate attributes getting applied to both the block and its wrapper element.

## 0.11.0

## 0.10.0

### Minor Changes

- 39149d5: 🧨 Breaking: `fetchAllEntries`/`getAllContent` now returns the array of contents directly, instead of an object with a `results` property.

## 0.9.0

### Patch Changes

- 435c5ee: Fix: style parsing and sanitization
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

### Patch Changes

- f5ea331: Fix: dynamic import of `isolated-vm` to rely on `createRequire` instead of `eval("require")`

## 0.8.0

## 0.7.6

### Patch Changes

- 992a97e: Fix: Show & Hide If properties when combined with repeated elements

## 0.7.5

### Patch Changes

- ddb31e4: Fix: setting default input values
- ddb31e4: Fix: collection repetition bug for empty/undefined lists

## 0.7.4

## 0.7.3

## 0.7.2

## 0.7.1

### Patch Changes

- 89e5965: Fix URL polyfill in react-native-web environments
- f7e1a5e: Chore: added changesets workflow to automate changelogs and release process
- 89e5965: add `isolated-vm` package to sandbox VM code when running in Node environments
- 89e5965: fix broken content reactivity
- 89e5965: Fix placeholder-runtime import causing runtime crash on devices.

## 0.7.0

- Setting `noTraverse` option's default to `true` when fetching multiple content entries.

## 0.6.4

- No Change.

## 0.6.3

- Fix issue with block styles not updating when editing them.

## 0.6.2

- No Changes.

## 0.6.1

- No Changes.

## 0.6.0

- Update build pipeline to generate 3 separate bundles for each environment: browser, node and edge runtimes.
- Use https://github.com/callstack/react-native-builder-bob to build SDK instead of `tsc`

## 0.5.9

No Changes.

## 0.5.8

- Fix: properly serialize messages sent to visual editor.

## 0.5.7

- Fix: Drag'n'Drop in Visual Editor (rendered elements were missing `builder-id` attribute)

## 0.5.6

- Fix: use `ScrollView` instead of `View` for the `RenderContent` wrapper, to allow for scrolling the Builder content.
- Fix: use `View` instead of HTML tagnames for Block wrappers, preventing crashes when rendering content.

## 0.5.5

- Fix: remove `lru-cache` import and usage.

## 0.5.4

- Fix build issues caused by extraneous `acorn` import.
- Put Edge runtime evaluator behind dynamic import.

## 0.5.2

- Fix: remove old `evaluate` logic that accidentally stayed in the bundle.

## 0.5.1

- Fix: make `RenderBlocks` properties `context` and `registeredComponents` optional for external use.

## 0.5.0

- Feature: Added support for rudimentary data-bindings in Non-Node.js (edge, serverless, etc.) server runtimes.

## 0.4.5

- Fix: show dynamic symbols correctly in Preview mode.
- Feature: SSR A/B test Symbols nested inside page content.

## 0.4.4

- Fix: tracking URL from `builder.io/api/v1/track` to `cdn.builder.io/api/v1/track` for improved reliability.

## 0.4.3

- Fix: SSR A/B test environment check (`isHydrationTarget`) now accurately checks current environment.

## 0.4.2

- No external changes.

## 0.4.1

- Fix: bring back `getBuilderSearchParams` export that was accidentally removed.

## 0.4.0

- No changes.

## 0.3.1

- Feature: Added SDK version to data sent to visual editor for improved debugging.
- Fix: Columns block: removed redundant margin-left in first column.

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

- Fix: Removed Columns `width` style causing crash due to `calc()` CSS value.

## 0.1.14

- Fix: Columns styles causing crash due to `number` values being written as `string`s.

## 0.1.13

- Fix: Columns block styling & `stackColumnsAt` prop

## 0.1.12

- Fix: `RenderContent` not re-rendering when its `content` updates. This fixes Symbol rendering in the visual editor.
- Feature: `RenderContent` and `getContent` now have an `apiVersion` field that can be set to `v2` or `v3` to target specific Builder API versions. Current default is `v2`
- Fix: Visual Editor drag'n'drop experience

## 0.1.11

- Fix: Builder blocks no longer add a redundant `Text` wrapper around their `children`.

## 0.1.10

- Fix: Builder Content blocks are now wrapped in `ScrollView` instead of `View` to allow scrolling.

## 0.1.9

- Fix: Section component

## 0.1.8

- Added support for "Show If" & "Hide If" dynamic bindings to elements.

## 0.1.7

- No changes.

## 0.1.6

- Types: removed redundant `builtIn` field in `customComponents` prop types

## 0.1.5

No Changes.

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

🐛 Fix: image block `srcSet` was incorrectly set as `srcset`

## 0.0.1-55

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

## 0.0.1-44

Changes:

- Fixes `getAllContent` to traverse all nested data from symbols/references https://github.com/BuilderIO/builder/pull/718
- Fixes `getContent` (broken due to missing URL polyfill) https://github.com/BuilderIO/builder/pull/880
- Strips invalid `this.` left from Mitosis compilation https://github.com/BuilderIO/builder/pull/717/commits/b1947c86db769f74a7408965dac70f22dfcc538d
- Fix identification of react-native environment https://github.com/BuilderIO/builder/pull/717/commits/9d2a207ceca39bf83d5bbdc4bd67351e86105d78
- Fix Aspect Ratio handling (this adds support for Pixel Tracking) https://github.com/BuilderIO/builder/pull/749, preceeded by https://github.com/BuilderIO/builder/pull/687
