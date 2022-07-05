### 0.0.1-9

🐛 Fix: custom components were not rendering correctly
🐛 Fix: Image component's `srcSet` was not being set correctly

### 0.0.1-8

🧨 Breaking change: the format of the `customComponents` prop has changed from `[{ component, info }]` to `[{ component, ...info }]`.
See [builder-registered-components.ts](/packages/sdks/src/constants/builder-registered-components.ts) for examples of how to do so, or see the example provided for this SDK.

### 0.0.1-7

⚠️ Deprecation notice: Registering components via `registerComponent(component, info)` is now deprecated.
To register your custom components in Builder, you must now provide a `customComponents` array to the `RenderContent` component containing `[{ component, info }]`.
See [builder-registered-components.ts](/packages/sdks/src/constants/builder-registered-components.ts) for examples of how to do so, or see the example provided for this SDK.

### 0.0.1-5

First working release
