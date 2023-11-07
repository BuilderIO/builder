### 0.7.0

- Setting `noTraverse` option's default to `true` when fetching multiple content entries.

### 0.6.4

- No Change.

### 0.6.3

- Fix issue with block styles not updating when editing them.

### 0.6.2

- No Changes.

### 0.6.1

- No Changes.

### 0.6.0

- Update build pipeline to generate 3 separate bundles for each environment: browser, node and edge runtimes.
- Fix: update content in Column block when edited within Visual Editor.

### 0.5.9

Fix: react and rerender components when Builder content updates.

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

### 0.5.2

- No Changes.

### 0.5.1

- Fix: make `RenderBlocks` properties `context` and `registeredComponents` optional for external use.

### 0.5.0

- Feature: Added support for rudimentary data-bindings in Non-Node.js (edge, serverless, etc.) server runtimes.

### 0.4.5

- Fix: show dynamic symbols correctly in Preview mode.
- Feature: SSR A/B test Symbols nested inside page content.

### 0.4.4

- Fix: tracking URL from `builder.io/api/v1/track` to `cdn.builder.io/api/v1/track` for improved reliability.

### 0.4.3

- Fix: SSR A/B test environment check (`isHydrationTarget`) now accurately checks current environment.

### 0.4.2

- No external changes.

### 0.4.1

- Fix: bring back `getBuilderSearchParams` export that was accidentally removed.

### 0.4.0

- Feature: A/B tests are now rendered correctly during server-side rendering (SSR) when applicable. This behaviour is backwards compatible with previous versions.
- Feature: Add support for `enrich` API flag.
- Mark `noTraverse` and `includeRefs` as deprecated.

### 0.3.1

- Feature: Added SDK version to data sent to visual editor for improved debugging.
- Fix: Columns block: removed redundant margin-left in first column.
- Fix: dynamic action bindings in repeated data.

### 0.3.0

- Updated `qwik` to `v1.0.0`

### 0.2.3

- No Changes.

### 0.2.2

- Fix: dynamic bindings for Link URLs.
- Fix: previewing content that includes a symbol whose `model` property is a `page`.
- Fix: "Show If"/"Hide If" bindings when the initial value is `undefined`.

### 0.2.1

Feature: Added support for reactive `state` values in JS code blocks provided by user.

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
