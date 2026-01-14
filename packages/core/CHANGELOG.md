# @builder.io/sdk

## 6.2.0

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

## 6.1.4

### Patch Changes

- 1b1b76e: chore: add back `description` support for inputs

## 6.1.3

### Patch Changes

- 3e864ce: fix: incorrect conversion tracking

## 6.1.2

### Patch Changes

- 648653e: FEAT: Updated 'Raw:Img' componentInfo with extra inputs field

## 6.1.1

### Patch Changes

- 33664b7: Fix: Corrected the conversion of query-objects with $-mongo-operators which are passed to builder.get() with apiEndpoint is "content"

## 6.1.0

### Minor Changes

- c7417f1: **Refactor Next.js SDK to support RSC-based hybrid editing for \[Text, Image, Video, Button, Section, Columns, Symbols]**
  - Client-side updates enabled for faster editing on Text, Image, Video, and Button
  - Section, Columns, and Symbols treated as server components for optimized SSR
  - Improved performance and flexibility for visual editing in RSC environments

## 6.0.9

### Patch Changes

- 1c659e9: feat: add support for register action

## 6.0.8

### Patch Changes

- a6eee0e: Fix: Functions in plugins will be selectively serialized

## 6.0.7

### Patch Changes

- c8d7674: Stricter trusted origin check

## 6.0.6

### Patch Changes

- 6d4e36b: fix: updated defaultStyles example

## 6.0.5

### Patch Changes

- ff56386: Fix: correctly set default value for `omit` field as `meta.componentsUsed` in Content API calls and preserve empty string

## 6.0.4

### Patch Changes

- 58fb07e: Fix: ability to set `builder.canTrack` before calling `builder.init()`

## 6.0.3

### Patch Changes

- b1ad88c: feat: Add support for "xsmall" breakpoint size in content entries.

## 6.0.2

### Patch Changes

- 306f8d5: Fix: add missing `folded` and `keysHelperText` types to custom component `Input`
- 306f8d5: Types: add `firstPublished` to BuilderContent

## 6.0.1

### Patch Changes

- c822422: Fix: symbols will now show published content instead of preview/autosave content while editing a page

## 6.0.0

### Major Changes

- 56f9461: - Adds `apiEndpoint` prop to `builder` instance with permitted values being `'content'` or `'query'`. It dictates which API endpoint is used for fetching Builder content
  - Breaking Change 🧨: Removes `apiEndpoint` argument from `builder.get()`, `builder.getAll()`, and the `options` prop of `<BuilderContent>` component. NOTE: this argument was not working as expected.

### Patch Changes

- 06b1124: Fix: remove `enrich=true` default option passed to the API and instead use `includeRefs=true` as default
- 409aec9: Feat: add `meta` type to custom components
- 40d572d: Renders Symbol correctly when apiEndpoint is 'content'
- 2fc9fc5: Fix: `onChange` functions passed to builder inputs can now receive async functions

## 5.0.0

### Major Changes

- f12f43d: Breaking Change: Use `/query` instead of `/content` for API calls. This change fixes a symbol rendering issue introduced in https://github.com/BuilderIO/builder/pull/3681, which was included in the 4.0.0 release.

## 4.0.3

### Patch Changes

- 9b11521: fix serializing single arg arrow functions that some compilers emit
- 027a07a: fix: standardize locale handling and pass through locale prop to personalization containers when filtering

## 4.0.2

### Patch Changes

- dda2ba4: Fix: Restrict event listening to when `isEditing === true`

## 4.0.1

### Patch Changes

- cf33d45: Fix: increase coverage of `trustedHost` check to all messages.

## 4.0.0

### Major Changes

- f4fffe9: Permanently removes the `apiEndpoint` prop from `builder.get()` and `builder.getAll()` which had options `'content'` and `'query'`. Content API is now the only possible API endpoint for content fetching.

### Patch Changes

- 443a3e3: Types: add jsdoc comments for some Builder SDK types

## 3.0.7

### Patch Changes

- bfe9d7e: Misc: send SDK headers in API requests ( https://github.com/BuilderIO/builder/pull/3659 )

## 3.0.6

### Patch Changes

- b5dd732: Feature: start sending accurate npm package version information to the Visual Editor

## 3.0.5

### Patch Changes

- 2ae3cc5: Feature: add `fetchOptions` to `options` argument within `.get(modelName, options)` and `.getAll(modelName, options)`, which is passed to the `fetch` function.

## 3.0.4

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

## 3.0.3

### Patch Changes

- d403fca: Adds `apiEndpoint` prop to `builder.get()` and `builder.getAll()` with options `'content'` and `'query'`. It dictates which API endpoint is used for the content fetching.
  Defaults to `'query'`

## 3.0.2

### Patch Changes

- 1118b05: Add built-in personalization container to suppoert block level personalization

## 3.0.1

### Patch Changes

- 69859d4: serialize functions for registering plugins so you can have showIf on fields as functions

## 3.0.0

### Major Changes

- bc1d409: Fix: Reintroduced `JSON.stringify(userAttributes)` change to standardize parsing logic and preserve strings. This is a breaking change as it doesn't require manual stringification of `userAttributes` values. Ensure that attributes are not manually stringified before passing them to avoid potential issues.

### Patch Changes

- 1586519: Fix: remove `next: { revalidate: 1 }` in SDKs fetch

## 2.2.9

### Patch Changes

- b7c00cf: Silence errors from non essential query params parsing

## 2.2.8

### Patch Changes

- 11e118c: Fix: serialize all functions within registered component info.

## 2.2.7

### Patch Changes

- b965695: Fix: reverts `v2.2.5` change to `userAttributes` parsing logic, as it caused breaking changes in certain cases.

## 2.2.6

### Patch Changes

- 1defae7: Refactor: move Embed iframe generation to Visual Editor

## 2.2.5

### Patch Changes

- a5b8810: Fix: handle parsing of stringified numeric values in `userAttributes`

## 2.2.4

### Patch Changes

- 4aaba38: Fix: bump `isolated-vm` dependency to `5.0.0`, adding support for Node v22.

## 2.2.3

### Patch Changes

- 46c38b8: Fix: Mark component types as `readonly`.

## 2.2.2

### Patch Changes

- f67242f: types: add `meta` property to Input

## 2.2.0

- Stricter checking of trusted hosts.

## 2.1.2

- Fix secure cookie spacing.

## 2.1.1

- Accept `authToken` option in `getAll` to fetch private models.

## 2.1.0

- Setting `noTraverse` option's default to `true` when fetching multiple content entries.

## 2.0.8

- Fix: remove `setImmediate` usage to fix issue with next.js edge runtime.

## 2.0.7

- Fix: remove dev dependency from `dependencies` (`nx` and `nx-cloud`)

## 2.0.6

- Allow `builder.get` to be awaited: https://github.com/BuilderIO/builder/pull/2512

## 2.0.5

- Add `setServerContext` to allow user to set the execution context of custom code bindings on the server.

## 2.0.4

- change the way we import ApiVersion type

## 2.0.3

- Feature: Add support for `enrich` API flag.
- Mark `includeRefs` as deprecated.

## 2.0.0

- `apiVersion` property now defaults to `v3`.

## 1.3.0

- `apiVersion` property now defaults to `v1`.

## 1.2.0

- `apiVersion` property now defaults to `v3`.

## 1.1.35

- Add new `apiVersion` property to toggle between Builder API versions. Defaults to `v1`. Possible values: `v1` and `v3`.

## 1.1.34

- Use correct types for enum, fixes remix type checks.
- Use fetch fallback safely, fixes issues on Salesforce managed runtime.

## 1.1.33

- Use correct types for `responsiveStyles`, fixes remix type checks.

## 1.1.30

- Add support for threhold and repeat inputs on `ScrollInvView` animations.

## 1.1.29

- added types for `override` option

## 1.1.27

- improved logging during JSON.parse errors
- deprecation notice on `Builder.VERSION`
- stop tracking impressions for content with no id

## 1.1.26

- fix: respect `builder.canTrack` for not setting the session cookie https://github.com/BuilderIO/builder/pull/900
