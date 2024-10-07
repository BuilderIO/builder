# @builder.io/sdk

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
