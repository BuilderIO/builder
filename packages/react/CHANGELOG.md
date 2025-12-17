# @builder.io/react

## 9.1.0

### Minor Changes

- c729e93: Feat: Add support for `enrichOptions` parameter to control reference enrichment depth and field selection when fetching content.

  This feature allows you to:

  - Control the depth level of nested reference enrichment (up to 4 levels)
  - Selectively include/exclude fields for each referenced model type
  - Optimize API responses by fetching only the data you need

  Example usage:

  ```typescript
  // Basic enrichment with depth control
  await builder.getAll("page", {
    enrich: true,
    enrichOptions: {
      enrichLevel: 2, // Fetch 2 levels of nested references
    },
  });

  // Advanced: Selective field inclusion per model
  await builder.getAll("page", {
    enrich: true,
    enrichOptions: {
      enrichLevel: 3,
      model: {
        product: {
          fields: "id,name,price",
          omit: "data.internalNotes",
        },
        category: {
          fields: "id,name",
        },
      },
    },
  });
  ```

### Patch Changes

- Updated dependencies [c729e93]
  - @builder.io/sdk@6.2.0

## 9.0.1

### Patch Changes

- 1b1b76e: chore: add back `description` support for inputs
- Updated dependencies [1b1b76e]
  - @builder.io/sdk@6.1.4

## 9.0.0

### Major Changes

- ba80951: Bump dependency `isolated-vm` from `5.0.0` to `6.0.0` to add support for Node v24.

  BREAKING CHANGE: Drops support for Node 18 and 20.

## 8.2.9

### Patch Changes

- 3e864ce: fix: incorrect conversion tracking
- Updated dependencies [3e864ce]
  - @builder.io/sdk@6.1.3

## 8.2.8

### Patch Changes

- 958c11b: fix: handle `fetchpriority` casing in different react versions

## 8.2.7

### Patch Changes

- c042d67: fix passing down custom breakpoints to Symbol
- 912bfa4: Fixed state variable context availability in SSR rendering

## 8.2.6

### Patch Changes

- 648653e: FEAT: Updated 'Raw:Img' componentInfo with extra inputs field
- Updated dependencies [648653e]
  - @builder.io/sdk@6.1.2

## 8.2.5

### Patch Changes

- 33664b7: Fix: Corrected the conversion of query-objects with $-mongo-operators which are passed to builder.get() with apiEndpoint is "content"
- Updated dependencies [33664b7]
  - @builder.io/sdk@6.1.1

## 8.2.4

### Patch Changes

- Updated dependencies [c7417f1]
  - @builder.io/sdk@6.1.0

## 8.2.3

### Patch Changes

- 7adc4f6: Fix: Corrected the implementaion of http requests with GET method
- 25895a2: Fix: Improved implementation of making Content http-requests with GET method

## 8.2.2

### Patch Changes

- 31a0d0e: feat: add `nonce` support for Content Security Policy

## 8.2.1

### Patch Changes

- 7a0d981: fix: Form submission should use the radio button value rather than name

## 8.2.0

### Minor Changes

- 3f84ee5: Feature: Added support for POST requests in Content HTTP Requests

## 8.1.2

### Patch Changes

- Updated dependencies [1c659e9]
  - @builder.io/sdk@6.0.9

## 8.1.1

### Patch Changes

- 59cf58a: Add loading=lazy to RawImg component for better perf
- Updated dependencies [a6eee0e]
  - @builder.io/sdk@6.0.8

## 8.1.0

### Minor Changes

- e060d32: Add srcset to raw Img component, use intersection observers for Video component

### Patch Changes

- c8d7674: Stricter trusted origin check
- Updated dependencies [c8d7674]
  - @builder.io/sdk@6.0.7

## 8.0.13

### Patch Changes

- 6d4e36b: fix: updated defaultStyles example
- Updated dependencies [6d4e36b]
  - @builder.io/sdk@6.0.6

## 8.0.12

### Patch Changes

- ff56386: Fix: correctly set default value for `omit` field as `meta.componentsUsed` in Content API calls and preserve empty string
- Updated dependencies [ff56386]
  - @builder.io/sdk@6.0.5

## 8.0.11

### Patch Changes

- 93999c0: Fix: centering items inside columns when columns has a fixed height

## 8.0.10

### Patch Changes

- 372746e: Feat: add title option for images

## 8.0.9

### Patch Changes

- 3c77cc7: chore: send `apiKey` to Visual Editor to improve editing experience.

## 8.0.8

### Patch Changes

- abe5cba: Fix: hydration mismatch error and reactivity of Personalization Containers when `userAttributes` cookie value is updated.

## 8.0.7

### Patch Changes

- 58fb07e: Fix: ability to set `builder.canTrack` before calling `builder.init()`
- Updated dependencies [58fb07e]
  - @builder.io/sdk@6.0.4

## 8.0.6

### Patch Changes

- 2cf49b4: Fix: Removed z-index from video component as its hiding the child elements
- b1ad88c: feat: Add support for "xsmall" breakpoint size in content entries.
- Updated dependencies [b1ad88c]
  - @builder.io/sdk@6.0.3

## 8.0.5

### Patch Changes

- 37c9341: fix: add builder block id only if its present

## 8.0.4

### Patch Changes

- b0aeaaa: Fix: Dynamic symbols not rendering properly in Visual Editor.

## 8.0.3

### Patch Changes

- 306f8d5: Fix: add missing `folded` and `keysHelperText` types to custom component `Input`
- 306f8d5: Types: add `firstPublished` to BuilderContent
- Updated dependencies [306f8d5]
- Updated dependencies [306f8d5]
  - @builder.io/sdk@6.0.2

## 8.0.2

### Patch Changes

- c822422: Fix: symbols will now show published content instead of preview/autosave content while editing a page
- Updated dependencies [c822422]
  - @builder.io/sdk@6.0.1

## 8.0.1

### Patch Changes

- 94fdaee: Fix: clearing image from content input not reflecting in symbols without page refresh.

## 8.0.0

### Major Changes

- 56f9461: - Adds `apiEndpoint` prop to `builder` instance with permitted values being `'content'` or `'query'`. It dictates which API endpoint is used for fetching Builder content
  - Breaking Change 🧨: Removes `apiEndpoint` argument from `builder.get()`, `builder.getAll()`, and the `options` prop of `<BuilderContent>` component. NOTE: this argument was not working as expected.

### Patch Changes

- 06b1124: Fix: remove `enrich=true` default option passed to the API and instead use `includeRefs=true` as default
- a8009ba: Fix: hydration errors in Next v15 while a user is editing
- 409aec9: Feat: add `meta` type to custom components
- 40d572d: Renders Symbol correctly when apiEndpoint is 'content'
- 23b7594: Feat: extend allowed file types of Image and Video Block
- ee436bf: Fix: `locale` prop to automatically resolve localized fields
- 2fc9fc5: Fix: `onChange` functions passed to builder inputs can now receive async functions
- Updated dependencies [06b1124]
- Updated dependencies [56f9461]
- Updated dependencies [409aec9]
- Updated dependencies [40d572d]
- Updated dependencies [2fc9fc5]
  - @builder.io/sdk@6.0.0

## 7.0.1

### Patch Changes

- bf8d783: feat: allow symbols to be edited in the context of a parent entry

## 7.0.0

### Major Changes

- f12f43d: Breaking Change: Use `/query` instead of `/content` for API calls. This change fixes a symbol rendering issue introduced in https://github.com/BuilderIO/builder/pull/3681, which was included in the 6.0.0 release.

### Patch Changes

- Updated dependencies [f12f43d]
  - @builder.io/sdk@5.0.0

## 6.0.4

### Patch Changes

- b0ab0f5: Add support for dynamic bindings in responsive styles

## 6.0.3

### Patch Changes

- 9b11521: fix serializing single arg arrow functions that some compilers emit
- 027a07a: fix: standardize locale handling and pass through locale prop to personalization containers when filtering
- Updated dependencies [9b11521]
- Updated dependencies [027a07a]
  - @builder.io/sdk@4.0.3

## 6.0.2

### Patch Changes

- dda2ba4: Fix: Add `trustedHost` checks to all remaining event listeners
- dda2ba4: Fix: Restrict event listening to when `isEditing === true`
- Updated dependencies [dda2ba4]
  - @builder.io/sdk@4.0.2

## 6.0.1

### Patch Changes

- cf33d45: Fix: increase coverage of `trustedHost` check to all messages.
- Updated dependencies [cf33d45]
  - @builder.io/sdk@4.0.1

## 6.0.0

### Major Changes

- f4fffe9: Permanently removes the `apiEndpoint` prop from `builder.get()` and `builder.getAll()` which had options `'content'` and `'query'`. Content API is now the only possible API endpoint for content fetching.

### Patch Changes

- Updated dependencies [f4fffe9]
- Updated dependencies [443a3e3]
  - @builder.io/sdk@4.0.0

## 5.0.11

### Patch Changes

- bfe9d7e: Misc: send SDK headers in API requests ( https://github.com/BuilderIO/builder/pull/3659 )
- Updated dependencies [bfe9d7e]
  - @builder.io/sdk@3.0.7

## 5.0.10

### Patch Changes

- b5dd732: Feature: start sending accurate npm package version information to the Visual Editor
- Updated dependencies [b5dd732]
  - @builder.io/sdk@3.0.6

## 5.0.9

### Patch Changes

- 6375b42: Misc: allow react 19 RC releases as a peer dependency (to work with nextjs 15)

## 5.0.8

### Patch Changes

- 2ae3cc5: Feature: add `fetchOptions` to `options` argument within `.get(modelName, options)` and `.getAll(modelName, options)`, which is passed to the `fetch` function.
- 54af3bb: Fix: previewing SDK content within the Studio tab of the Builder Visual Editor.
- Updated dependencies [2ae3cc5]
  - @builder.io/sdk@3.0.5

## 5.0.7

### Patch Changes

- 49d0aa3: [Types]: adds a second argument to the `onChange` argument for custom component Inputs called `previousOptions`. It contains the `options` argument in its old state before the current `onChange` event was triggered.

  Before:

  ```ts
  onChange?:
    | ((options: Map<string, any>) => void | Promise<void>)
    | string;
  ```

  After:

  ```ts
    onChange?:
      | ((options: Map<string, any>, previousOptions?: Map<string, any>) => void | Promise<void>)
      | string;
  ```

- Updated dependencies [49d0aa3]
  - @builder.io/sdk@3.0.4

## 5.0.6

### Patch Changes

- d403fca: Adds `apiEndpoint` prop to `builder.get()` and `builder.getAll()` with options `'content'` and `'query'`. It dictates which API endpoint is used for the content fetching.
  Defaults to `'query'`
- Updated dependencies [d403fca]
  - @builder.io/sdk@3.0.3

## 5.0.5

### Patch Changes

- 0fc86b4: Fix: server-side-rendering of dynamic style bindings

## 5.0.4

### Patch Changes

- bba43e6: This introduces two new custom events to enhance tracking and analytics for personalization container variants:

  1. `builder.variantLoaded`: Fired when a variant is loaded.
  2. `builder.variantDisplayed`: Fired when a variant becomes visible in the viewport.

  ### Changes

  - Added `builder.variantLoaded` event dispatch when a variant is loaded.
  - Implemented an Intersection Observer to trigger the `builder.variantDisplayed` event when the variant enters the viewport.
  - These events are only fired when not in editing or preview mode.

  ### Example Usage

  These events can be listened to for analytics or other custom behaviors:

  ```javascript
  document.addEventListener("builder.variantLoaded", (event) => {
    // This will either be a variant object like { name: 'My Variant', query: [...], startDate: ..., endDate: ... }
    // or the string 'default'
    console.log("Variant loaded:", event.detail.variant);
    // This will be the content object like { name: 'My page', id: '...', ... }
    console.log("Content:", event.detail.content);
    // Perform analytics or other actions
  });

  document.addEventListener("builder.variantDisplayed", (event) => {
    console.log("Variant displayed:", event.detail.variant);
    console.log("Content:", event.detail.content);
    // Track impressions or perform other visibility-dependent actions
  });
  ```

  ### Benefits

  - Improved tracking capabilities for personalization variants.
  - Enables more granular analytics for when variants are loaded and actually viewed.
  - Provides hooks for developers to implement custom behaviors based on variant lifecycle events.

- 8137ce5: Fix: prevent Embed and Custom Code blocks from re-rendering when page orientation changes

## 5.0.3

### Patch Changes

- 20953a8: Disable localization on dynamic container inputs

## 5.0.2

### Patch Changes

- 1118b05: Add built-in personalization container to suppoert block level personalization
- Updated dependencies [1118b05]
  - @builder.io/sdk@3.0.2

## 5.0.1

### Patch Changes

- 69859d4: serialize functions for registering plugins so you can have showIf on fields as functions
- Updated dependencies [69859d4]
  - @builder.io/sdk@3.0.1

## 5.0.0

### Major Changes

- bc1d409: Breaking Change 🧨: `userAttributes` now is parsed as an object - `JSON.stringify(userAttributes)` which preserves strings. Users no longer need to manually stringify anything unless they have explicitly included it in custom targeting attributes.

  For example,

  ```js
  userAttributes: {
    stringWithStrs: ["a", "c"];
  }
  ```

  used to work as well as this,

  ```js
  userAttributes: {
    stringWithStrs: ["'a'", "'c'"];
  }
  ```

  but now its not needed to manually stringify strings. This change was needed to preserve data types and strings so previously when we passed,

  ```js
  userAttributes: {
    stringWithNums: ["1", "2"];
  }
  ```

  they were actual string numbers but we failed to parse it because we were not preserving the strings and users had to perform manual stringification hacks like `"'1'"` to achieve correct result. With this change stringified numbers/bools etc will work out of the box as expected showing less room for randomness.

### Patch Changes

- 1586519: Fix: remove `next: { revalidate: 1 }` in SDKs fetch
- Updated dependencies [bc1d409]
- Updated dependencies [1586519]
  - @builder.io/sdk@3.0.0

## 4.0.4

### Patch Changes

- b7c00cf: Fix SSR hydration issues with non-hover animated builder blocks
- Updated dependencies [b7c00cf]
  - @builder.io/sdk@2.2.9

## 4.0.3

### Patch Changes

- 11e118c: Fix: serialize all functions within registered component info.
- Updated dependencies [11e118c]
  - @builder.io/sdk@2.2.8

## 4.0.2

### Patch Changes

- Updated dependencies [b965695]
  - @builder.io/sdk@2.2.7

## 4.0.1

### Patch Changes

- 4ee499e: Fix: Image block: remove redundant `srcset` for SVG images

## 4.0.0

### Major Changes

- d031580: Breaking Change 🧨: Columns block now computes percentage widths correctly, by subtracting gutter space proportionally to each percentage.
  Previously, it computed the column's widths by subtracting gutter space equally from each column's width. This previous behavior was incorrect, and most strongly felt when the `space` was a substantially high percentage of the total width of the Columns block.

## 3.2.12

### Patch Changes

- 1defae7: Refactor: move Embed iframe generation to Visual Editor
- Updated dependencies [1defae7]
  - @builder.io/sdk@2.2.6

## 3.2.11

### Patch Changes

- 6187c39: Fix: `required` option for TextArea and Select blocks
- 767795c: Fix binding to array property getters and methods in server context

## 3.2.10

### Patch Changes

- bb4a5fd: Feature: add `webp` support for Image block file uploads.
- 1f62b28: Fix: Remove `iframely` API key from Embed block logic.
- Updated dependencies [a5b8810]
  - @builder.io/sdk@2.2.5

## 3.2.9

### Patch Changes

- 945f26e: Adds the `highPriority` option to the Image block component to ensure eager loading.

## 3.2.8

### Patch Changes

- 4aaba38: Fix: bump `isolated-vm` dependency to `5.0.0`, adding support for Node v22.
- Updated dependencies [4aaba38]
  - @builder.io/sdk@2.2.4

## 3.2.7

### Patch Changes

- Updated dependencies [46c38b8]
  - @builder.io/sdk@2.2.3

## 3.2.6

### Patch Changes

- 6dd554f: Update readme with absolute URLs

## 3.2.5

### Patch Changes

- c32cbd6: Support single jsx node as `props.children` in `withChildren`

## 3.2.4

### Patch Changes

- 3764321: Fix: replace broken default value of Video Block with a working link.

## 3.2.3

### Patch Changes

- f67242f: types: add `meta` property to Input
- Updated dependencies [f67242f]
  - @builder.io/sdk@2.2.2

## 3.2.2

- Fix: `deviceSize` state not getting set properly.

## 3.2.1

- Fix: sigfault crash when using SDK in Node v20 + M1 Macs. Skips usage of `isolated-vm` in those environments.

## 3.2.0

- Stricter checking of trusted hosts.

## 3.1.2

- Use latest core sdk, to fix secure cookie spacing.

## 3.1.1

- Use latest core sdk, to enable passing `authToken` to `getAll` on private models.

## 3.1.0

- Updated to use latest core sdk (v2.1.0) which now uses `true` as default for `noTraverse` option when fetching multiple content entries.

## 3.0.14

- Fix: Update core sdk to fix issue with edge runtime in next.js

## 3.0.13

- Add support for `customComponents` prop on `BuilderComponent`
- Fix: SSR with text block eval expression

## 3.0.12

- Fix: remove dev dependency from `dependencies` (`nx` and `nx-cloud`)

## 3.0.11

- Add support for loading symbols from other spaces for the `global symbols` feature.

## 3.0.10

- Allow `builder.get` to be awaited: https://github.com/BuilderIO/builder/pull/2512

## 3.0.9

- Fix issue with collection/repeat and returning objects from code bindings in SSR.

## 3.0.8

- Replace deprecated package `vm2` with `isolated-vm`.
- Fix for excessive caching in nextjs 13

## 3.0.7

- add back the process keyword with a check for `typeof process` to fix Hydrogen SSR

## 3.0.6

- remove process keyword to fix Hydrogen SSR

## 3.0.5

- Fix: Pass locale from parent state to Symbols

## 3.0.4

- Chore: update `@builder.io/core` to `^2.0.4` to fix import issue

## 3.0.3

- Feature: Add support for `enrich` API flag.
- Mark `includeRefs` as deprecated.

## 3.0.0

- `apiVersion` property now defaults to `v3`.

## 2.2.0

- Sets the default `apiVersion` to `v1`.

## 2.1.0

- Sets the default `apiVersion` to `v3`.

In case you feel the need to use our older API Version `v1`, reach out to us at support@builder.io first. But you can override the default by setting `apiVersion` explicitly to `v1` as follows:

```js
import { builder } from "@builder.io/react";

builder.init("YOUR_BUILDER_PUBLIC_KEY");
builder.apiVersion = "v1";
```

More details on the Builder API Versions visit [this link](https://www.builder.io/c/docs/content-api-versions).

## 2.0.17

- Add new `apiVersion` property to toggle between Builder API versions. Defaults to `v1`. Possible values: `v1` and `v3`.

You can set the apiVersion using `builder.init` or `builder.apiVersion`:

```js
import { builder } from "@builder.io/react";

builder.init("YOUR_BUILDER_PUBLIC_KEY");
builder.apiVersion = "v3";
```

## 2.0.16

- Safe access to node-fetch and process.env.

## 2.0.15

- Use correct types for `responsiveStyles`, fixes remix type checks.

## 2.0.13

- Fix hydration errors when a/b testing with react 18
- Fix overriding state in editor's data tab.

## 2.0.10

- Fix issue with Hydrogen SSR.
- Return null values in bindings when VM2 is not available on the server.

## 2.0.9

- Fix for `require` is not defined bug on client side.

## 2.0.8

- Fix SSR issue with hydration
- Add support for custom breakpoints

## 2.0.6

- Add support for `threshold` and `repeat` options on `ScrollInView` animations.

## 2.0.6

- added types for `override` option

## 2.0.5

- Add support for locale prop on `BuilderComponent` to auto-resolve localized inputs.
- Use the latest core sdk version which addresss an issue with rendering in a middleware (also a shopify hydrogen issue, https://github.com/BuilderIO/builder/issues/610).

## 2.0.4

- updates the patching logic to fix bug while where styling updates in the builder editor don’t properly apply (will quickly revert, until you refresh the preview)

## 2.0.3

- Fix an issue with previewing drafts of a published data model rendered by `BuilderContent`.
- Fix an issue with live editing on a `BuilderContent` containing a `BuilderComponent` of the same model.

## 2.0.3

- Fix an issue with previewing drafts of a published data model rendered by `BuilderContent`.
- Fix an issue with live editing on a `BuilderContent` containing a `BuilderComponent` of the same model.

## 2.0.2

- Move React/React-dom to peer dependencies to fix installation warnings.
- Add support for templated variables `{{foo}}` in `Text` block.
- Update vm2 dependency to `3.9.10`.

## 2.0.1

- Add new hook `useIsPreviewing` to be used instead of `Builder.isEditing` and `Builder.isPreviewing` flags, to fix hydration warnings while editing or previewing.

## 2.0.0

- update minimum required react version to >= 16.8

## 1.1.50

- update `@builder.io/sdk` to `1.1.26` (adds bugfix to `noTrack` correctly ignoring session cookies)
