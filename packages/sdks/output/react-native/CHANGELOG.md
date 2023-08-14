### 0.5.8

- Fix: properly serialize messages sent to visual editor.

### 0.5.7

- Fix: Drag'n'Drop in Visual Editor (rendered elements were missing `builder-id` attribute)

### 0.5.6

- Fix: use `ScrollView` instead of `View` for the `RenderContent` wrapper, to allow for scrolling the Builder content.
- Fix: use `View` instead of HTML tagnames for Block wrappers, preventing crashes when rendering content.

### 0.5.5

- Fix: remove `lru-cache` import and usage.

### 0.5.4

- Fix build issues caused by extraneous `acorn` import.
- Put Edge runtime evaluator behind dynamic import.

### 0.5.2

- Fix: remove old `evaluate` logic that accidentally stayed in the bundle.

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

- No changes.

### 0.3.1

- Feature: Added SDK version to data sent to visual editor for improved debugging.
- Fix: Columns block: removed redundant margin-left in first column.

### 0.3.0

- No Changes.

### 0.2.3

- No Changes.

### 0.2.2

- Fix: dynamic bindings for Link URLs.
- Fix: previewing content that includes a symbol whose `model` property is a `page`.
- Fix: "Show If"/"Hide If" bindings when the initial value is `undefined`.

### 0.2.1

- No Changes.

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

### 0.1.16

- No changes.

### 0.1.15

- Fix: Removed Columns `width` style causing crash due to `calc()` CSS value.

### 0.1.14

- Fix: Columns styles causing crash due to `number` values being written as `string`s.

### 0.1.13

- Fix: Columns block styling & `stackColumnsAt` prop

### 0.1.12

- Fix: `RenderContent` not re-rendering when its `content` updates. This fixes Symbol rendering in the visual editor.
- Feature: `RenderContent` and `getContent` now have an `apiVersion` field that can be set to `v2` or `v3` to target specific Builder API versions. Current default is `v2`
- Fix: Visual Editor drag'n'drop experience

### 0.1.11

- Fix: Builder blocks no longer add a redundant `Text` wrapper around their `children`.

### 0.1.10

- Fix: Builder Content blocks are now wrapped in `ScrollView` instead of `View` to allow scrolling.

### 0.1.9

- Fix: Section component

### 0.1.8

- Added support for "Show If" & "Hide If" dynamic bindings to elements.

### 0.1.7

- No changes.

### 0.1.6

- Types: removed redundant `builtIn` field in `customComponents` prop types

### 0.1.5

No Changes.

### 0.1.4

No Changes.

### 0.1.3

- Support Heatmaps
- Support Insights data filtering by URL & Device

### 0.1.2

- Fix: respect when `canTrack` is set to `false`
- Fix: issues sending session and visitor IDs with tracking events

### 0.1.1

🧨 Breaking change: we no longer provide a `node-fetch` polyfill. See [the docs](./README.md#fetch) for more information.

### 0.0.1-56

🐛 Fix: image block `srcSet` was incorrectly set as `srcset`

### 0.0.1-55

🐛 Fix: custom components were not rendering correctly
🐛 Fix: Image component's `srcSet` was not being set correctly

### 0.0.1-52

🧨 Breaking change: the format of the `customComponents` prop has changed from `[{ component, info }]` to `[{ component, ...info }]`.
See [builder-registered-components.ts](/packages/sdks/src/constants/builder-registered-components.ts) for examples of how to do so, or see the example provided for this SDK.

### 0.0.1-51

⚠️ Deprecation notice: Registering components via `registerComponent(component, info)` is now deprecated.
To register your custom components in Builder, you must now provide a `customComponents` array to the `RenderContent` component containing `[{ component, info }]`.
See [builder-registered-components.ts](/packages/sdks/src/constants/builder-registered-components.ts) for examples of how to do so, or see the example provided for this SDK.

### 0.0.1-50

- feat: 🎸 export `isPreviewing()` (https://github.com/BuilderIO/builder/pull/951)
- feat: 🎸 Add support for Symbols (https://github.com/BuilderIO/builder/pull/951)
- feat: 🎸 Add support for Data Bindings https://github.com/BuilderIO/builder/pull/970

- BREAKING CHANGE: 🧨 RenderContent must now be provided the `apiKey` as a prop (https://github.com/BuilderIO/builder/pull/951)

### 0.0.1-49

- Fix: show the "+ add block" button on empty pages https://github.com/BuilderIO/builder/pull/934
- Add `getBuilderSearchParams` helper export to easily view current drafts on your production site. https://github.com/BuilderIO/builder/pull/883

### 0.0.1-44

Changes:

- Fixes `getAllContent` to traverse all nested data from symbols/references https://github.com/BuilderIO/builder/pull/718
- Fixes `getContent` (broken due to missing URL polyfill) https://github.com/BuilderIO/builder/pull/880
- Strips invalid `this.` left from Mitosis compilation https://github.com/BuilderIO/builder/pull/717/commits/b1947c86db769f74a7408965dac70f22dfcc538d
- Fix identification of react-native environment https://github.com/BuilderIO/builder/pull/717/commits/9d2a207ceca39bf83d5bbdc4bd67351e86105d78
- Fix Aspect Ratio handling (this adds support for Pixel Tracking) https://github.com/BuilderIO/builder/pull/749, preceeded by https://github.com/BuilderIO/builder/pull/687
