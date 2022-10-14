### 2.0.10
- Fix issue with Hydrogen SSR.
- Return null values in bindings when VM2 is not available on the server.

### 2.0.9

- Fix for `require` is not defined bug on client side.

### 2.0.8

- Fix SSR issue with hydration
- Add support for custom breakpoints

### 2.0.6

- Add support for `threshold` and `repeat` options on `ScrollInView` animations.

### 2.0.6

- added types for `override` option

### 2.0.5

- Add support for locale prop on `BuilderComponent` to auto-resolve localized inputs.
- Use the latest core sdk version which addresss an issue with rendering in a middleware (also a shopify hydrogen issue, https://github.com/BuilderIO/builder/issues/610).

### 2.0.4

- updates the patching logic to fix bug while where styling updates in the builder editor don’t properly apply (will quickly revert, until you refresh the preview)

### 2.0.3

- Fix an issue with previewing drafts of a published data model rendered by `BuilderContent`.
- Fix an issue with live editing on a `BuilderContent` containing a `BuilderComponent` of the same model.

### 2.0.3

- Fix an issue with previewing drafts of a published data model rendered by `BuilderContent`.
- Fix an issue with live editing on a `BuilderContent` containing a `BuilderComponent` of the same model.

### 2.0.2

- Move React/React-dom to peer dependencies to fix installation warnings.
- Add support for templated variables `{{foo}}` in `Text` block.
- Update vm2 dependency to `3.9.10`.

### 2.0.1

- Add new hook `useIsPreviewing` to be used instead of `Builder.isEditing` and `Builder.isPreviewing` flags, to fix hydration warnings while editing or previewing.

### 2.0.0

- update minimum required react version to >= 16.8

### 1.1.50

- update `@builder.io/sdk` to `1.1.26` (adds bugfix to `noTrack` correctly ignoring session cookies)
