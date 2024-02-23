# @builder.io/react

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
import { builder } from '@builder.io/react';

builder.init('YOUR_BUILDER_PUBLIC_KEY');
builder.apiVersion = 'v1';
```

More details on the Builder API Versions visit [this link](https://www.builder.io/c/docs/content-api-versions).

## 2.0.17

- Add new `apiVersion` property to toggle between Builder API versions. Defaults to `v1`. Possible values: `v1` and `v3`.

You can set the apiVersion using `builder.init` or `builder.apiVersion`:

```js
import { builder } from '@builder.io/react';

builder.init('YOUR_BUILDER_PUBLIC_KEY');
builder.apiVersion = 'v3';
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
