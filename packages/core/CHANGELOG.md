# @builder.io/sdk

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
