# Builder.io Qwik SDK Changelog (@builder.io/sdk-qwik)

## 0.16.10

### Patch Changes

- a44d73b: Fix: add `types` `exports` key to fix TS types support for projects in `bundler` mode.

## 0.16.9

### Patch Changes

- 51285ea: Fix: repeat items when they are Symbols

## 0.16.7

### Patch Changes

- 9c4ab57: Feature: add `@builder.io/sdk-qwik/node/init` entry point with `initializeNodeRuntime` export that sets the IVM instance.

  This import should be called in a server-only location such as,

  ```tsx
  // entry.ssr.tsx
  import {
    renderToStream,
    type RenderToStreamOptions,
  } from "@builder.io/qwik/server";
  import { manifest } from "@qwik-client-manifest";
  import Root from "./root";
  import { initializeNodeRuntime } from "@builder.io/sdk-qwik/node/init";

  initializeNodeRuntime();

  export default function (opts: RenderToStreamOptions) {
    return renderToStream(<Root />, {
      manifest,
      ...opts,
      // ...
    });
  }
  ```

## 0.16.6

### Patch Changes

- 69859d4: serialize functions for registering plugins so you can have showIf on fields as functions

## 0.16.5

### Patch Changes

- e8b80b3: Fix: scoped `isInteractive` prop for RSC SDK only so that it fixes Inner Layout > "Columns" option during visual editing

## 0.16.4

### Patch Changes

- 345086b: Fixes data bindings in Text blocks

## 0.16.3

### Patch Changes

- 11e118c: Fix: serialize all functions within registered component info.

## 0.16.2

### Patch Changes

- 4ee499e: Fix: Image block: remove redundant `srcset` for SVG images
- 14da62f: Fix: restrict custom components to the models that get passed in `models`

## 0.16.1

### Patch Changes

- f6add9e: Feature: Add `nonce` prop to `<Content>`: allows SDK to set `nonce` attribute for its inlined `style` and `script` tags.

## 0.16.0

### Minor Changes

- 2c6330f: Breaking Change 🧨: updated `shouldReceiveBuilderProps` config of Registered Components, with the following NEW defaults:

  ```ts
  shouldReceiveBuilderProps: {
      builderBlock: false, // used to be `true`
      builderContext: false, // used to be `true`
      builderComponents: false, // unchanged
      builderLinkComponent: false, // unchanged
    },
  ```

  This means that by default, the SDK will no longer provide any Builder props unless its respective config is explicitly set to `true`.

- d031580: Breaking Change 🧨: Columns block now computes percentage widths correctly, by subtracting gutter space proportionally to each percentage.
  Previously, it computed the column's widths by subtracting gutter space equally from each column's width. This previous behavior was incorrect, and most strongly felt when the `space` was a substantially high percentage of the total width of the Columns block.

## 0.15.2

### Patch Changes

- 1defae7: Refactor: move Embed iframe generation to Visual Editor

## 0.15.1

### Patch Changes

- 22de13c: Fix: add missing `override` component config

## 0.15.0

### Minor Changes

- 3594120: Feature: add `shouldReceiveBuilderProps` config to Registered Components, with the following defaults:

  ```ts
  shouldReceiveBuilderProps: {
      builderBlock: true,
      builderContext: true,
      builderComponents: false,
      builderLinkComponent: false,
    },
  ```

  To configure a component to receive only certain Builder props, override the `shouldReceiveBuilderProps` config:

  Example:

  ```ts
  export const componentInfo = {
    name: "Text",

    shouldReceiveBuilderProps: {
      builderBlock: true,
      builderContext: false,
      builderComponents: true,
      builderLinkComponent: false,
    },

    inputs: [
      {
        name: "text",
        type: "html",
        required: true,
        autoFocus: true,
        bubble: true,
        defaultValue: "Enter some text...",
      },
    ],
  };
  ```

## 0.14.31

### Patch Changes

- 6187c39: Fix: `required` option for TextArea and Select blocks
- 6187c39: Feat: Add support for TextArea block

## 0.14.29

### Patch Changes

- bb4a5fd: Feature: add `webp` support for Image block file uploads.
- 1f62b28: Fix: Remove `iframely` API key from Embed block logic.

## 0.14.28

### Patch Changes

- 6c8db7e: Fix: check `e.origin` of the message to be a URL first

## 0.14.27

### Patch Changes

- a38eae0: Fix: pass Builder props to blocks and custom components only when needed.
- e31ef49: Misc: cleanup error message for edge runtime evaluation.
- 945f26e: Adds the `highPriority` option to the Image block component to ensure eager loading.

## 0.14.26

### Patch Changes

- b4381f5: Fix: `canTrack=false` not respected in Symbols

## 0.14.25

### Patch Changes

- 4aaba38: Fix: bump `isolated-vm` dependency to `5.0.0`, adding support for Node v22.

## 0.14.24

### Patch Changes

- 74d78e1: Fix: error in identifying model being previewed: https://github.com/BuilderIO/builder/pull/3310/files#diff-6293c2a27254fa850a123075284412ef86d270a4518e0ad3aad81132b590ea1cL311

## 0.14.23

### Patch Changes

- dc874a1: Fix: qwik sdk form event submissions

## 0.14.22

### Patch Changes

- f3aab34: Feat: Accordion widget for gen2 sdks

## 0.14.21

### Patch Changes

- 70fccea: Fix: `query` option correctly flattens mongodb queries

## 0.14.20

### Patch Changes

- af84d1e: Fix: make `initializeNodeRuntime` argument optional

## 0.14.19

### Patch Changes

- bd21dcf: Fix: improve NodeJS runtime performance by reusing the same IsolatedVM Isolate instance for all data bindings. Add the ability to provide arguments to configure the isolate in `initializeNodeRuntime` via an `ivmIsolateOptions` parameter.

## 0.14.18

### Patch Changes

- 84cd444: feature: add the Builder Tabs block (ported from gen1 widgets).

## 0.14.17

### Patch Changes

- 78dee25: Fix: remove redundant warning for evaluation of empty code blocks.

## 0.14.16

### Patch Changes

- f3c5ff3: Fix: `isPreviewing` logic on the server, and make usage of `isEditing` unnecessary.
- 46bd611: Feature: add support for hover animations.

## 0.14.15

### Patch Changes

- 7bad8d9: Fix: better error-logging for `isolated-vm` import.
- d8e08ae: Fix: `fetchOneEntry` prop types of `fetch` and `fetchOptions`

## 0.14.14

### Patch Changes

- a309a4f: Fix: add missing `key` prop to `Select` block's `option`

## 0.14.13

### Patch Changes

- cde7c61: feat: export `BuilderContext` from sdks

## 0.14.12

### Patch Changes

- 2ed2cb8: Fix: data connections making multiple unnecessary API calls

## 0.14.11

### Patch Changes

- 35fc152: Fix: add `data-id` attributes to all inline `script` and `style` tags

## 0.14.10

### Patch Changes

- 0ffbc58: Feature: add `fetch` and `fetchOptions` arguments to `fetchEntries` and `fetchOneEntry`.

## 0.14.9

### Patch Changes

- 2d5a016: Fix: remove forced re-render of `Content` internals.

## 0.14.8

### Patch Changes

- 2c93c95: Fix: Symbol styles overriding subsequent content styles.

## 0.14.7

### Patch Changes

- c880ef5: Fix: data state reactivity for nested components
- c880ef5: Feature: add Cache layer for dynamic binding evaluator

## 0.14.6

### Patch Changes

- b81e35a: fix: Image block `role='presentation'` set when altText prop is not provided.

## 0.14.5

### Patch Changes

- b659b6f: Fix: usage of `Blocks` in custom components not setting `BlocksWrapper` correctly.

## 0.14.4

### Patch Changes

- 9b873cd: Feature: allow passing `search` param (of type `URLSearchParams | string | object`) to `isPreviewing` and `isEditing` helpers. This allows users to rely on this function in SSR environments to determine whether the current request is a preview or edit request.

## 0.14.3

### Patch Changes

- 4528969: move `/edge`, `/node` and `/browser` sub-path exports to `/bundle/edge`, `/bundle/node` and `/bundle/browser`

## 0.14.2

### Patch Changes

- a730741: fix `userAttributes` types in `GetContentOptions`

## 0.14.1

### Patch Changes

- a4bfcbc: Fix: move dynamicRequire of `isolated-vm` outside of global scope to reduce crashes/issues.

## 0.14.0

### Minor Changes

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

## 0.12.8

### Patch Changes

- 6b32014: Add `subscribeToEditor()` export that allows listening to content changes. Helpful for previewing data models.

## 0.12.7

### Patch Changes

- cbc49e4: Feature: add Animations support

## 0.12.6

### Patch Changes

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

## 0.7.6

### Patch Changes

- 992a97e: Fix: Show & Hide If properties when combined with repeated elements

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

## 0.7.1

### Patch Changes

- f7e1a5e: Chore: added changesets workflow to automate changelogs and release process
- 89e5965: add `isolated-vm` package to sandbox VM code when running in Node environments
- 89e5965: Trigger visual editing logic via custom events instead of OnMount, removing all hydration logic.

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
- Fix: update content in Column block when edited within Visual Editor.

## 0.5.9

Fix: react and rerender components when Builder content updates.

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

## 0.5.2

- No Changes.

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

- Feature: A/B tests are now rendered correctly during server-side rendering (SSR) when applicable. This behaviour is backwards compatible with previous versions.
- Feature: Add support for `enrich` API flag.
- Mark `noTraverse` and `includeRefs` as deprecated.

## 0.3.1

- Feature: Added SDK version to data sent to visual editor for improved debugging.
- Fix: Columns block: removed redundant margin-left in first column.
- Fix: dynamic action bindings in repeated data.

## 0.3.0

- Updated `qwik` to `v1.0.0`

## 0.2.3

- No Changes.

## 0.2.2

- Fix: dynamic bindings for Link URLs.
- Fix: previewing content that includes a symbol whose `model` property is a `page`.
- Fix: "Show If"/"Hide If" bindings when the initial value is `undefined`.

## 0.2.1

Feature: Added support for reactive `state` values in JS code blocks provided by user.

## 0.2.0

- Sets the default `apiVersion` to `v3`.

In case you feel the need to use our older API Version `v2`, reach out to us at support@builder.io first. But you can override the default by setting `apiVersion` explicitly to `v2` as follows:

```jsx
<RenderContent apiVersion="v2" />
```

```js
getContent({ apiVersion: "v2" });
```

More details on the Builder API Versions visit [this link](https://www.builder.io/c/docs/content-api-versions).
