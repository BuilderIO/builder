# @builder.io/sdk-angular

## 0.2.14

### Patch Changes

- 8bfd467: Fix: update exported selector to `builder-content` to fix usage of Content component in Angular v18

## 0.2.13

### Patch Changes

- a44d73b: Fix: add `types` `exports` key to fix TS types support for projects in `bundler` mode.

## 0.2.12

### Patch Changes

- 51285ea: Fix: repeat items when they are Symbols

## 0.2.11

### Patch Changes

- 6003607: Fix: support destructuring out objects in Angular. Fixes slot, nested symbols and element event binding in blocks other than button

## 0.2.10

### Patch Changes

- cb68f66: Fix: update exported `content-variants` selector to `content`

## 0.2.9

### Patch Changes

- 69859d4: serialize functions for registering plugins so you can have showIf on fields as functions

## 0.2.8

### Patch Changes

- e8b80b3: Fix: scoped `isInteractive` prop for RSC SDK only so that it fixes Inner Layout > "Columns" option during visual editing

## 0.2.7

### Patch Changes

- 345086b: Fixes data bindings in Text blocks

## 0.2.6

### Patch Changes

- 22a3865: Fix: Symbol infinite re-render and editor overlay not showing up.
- a6c453f: Fix: support Visual Editing for Interactive Elements

## 0.2.5

### Patch Changes

- 53d3cf9: Fix: State inits in Angular which fixes repeat elements, show-if and hide-if and Columns
- 11e118c: Fix: serialize all functions within registered component info.

## 0.2.4

### Patch Changes

- 48ee285: Feat: optimise DOM updates with `trackBy` in angular

## 0.2.3

### Patch Changes

- 4ee499e: Fix: Image block: remove redundant `srcset` for SVG images
- 14da62f: Fix: restrict custom components to the models that get passed in `models`

## 0.2.2

### Patch Changes

- bdd3762: Fix: `onInit` hook to run initialisations (converted to `ngOnInit`) on both server and client and move `onMount` and `onUpdate` hooks to only run on browser (converted to `ngOnInit` and `ngOnChanges` respectively with browser check)

## 0.2.1

### Patch Changes

- f6add9e: Feature: Add `nonce` prop to `<Content>`: allows SDK to set `nonce` attribute for its inlined `style` and `script` tags.

## 0.2.0

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

## 0.1.2

### Patch Changes

- 1defae7: Refactor: move Embed iframe generation to Visual Editor

## 0.1.1

### Patch Changes

- 22de13c: Fix: add missing `override` component config

## 0.1.0

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

### Patch Changes

- 27c2175: Feat: add multi bundle support for angular sdk (node and browser)
- 5fb20a8: Fix: SSR for ab-tests and Symbols

## 0.0.10

### Patch Changes

- 6187c39: Fix: `required` option for TextArea and Select blocks
- 6187c39: Feat: Add support for TextArea block

## 0.0.9

### Patch Changes

- bb4a5fd: Feature: add `webp` support for Image block file uploads.
- 1f62b28: Fix: Remove `iframely` API key from Embed block logic.

## 0.0.8

### Patch Changes

- 6c8db7e: Fix: check `e.origin` of the message to be a URL first

## 0.0.7

### Patch Changes

- a38eae0: Fix: pass Builder props to blocks and custom components only when needed.
- e31ef49: Misc: cleanup error message for edge runtime evaluation.
- 945f26e: Adds the `highPriority` option to the Image block component to ensure eager loading.

## 0.0.6

### Patch Changes

- b4381f5: Fix: `canTrack=false` not respected in Symbols

## 0.0.5

### Patch Changes

- 4aaba38: Fix: bump `isolated-vm` dependency to `5.0.0`, adding support for Node v22.

## 0.0.4

### Patch Changes

- 74d78e1: Fix: error in identifying model being previewed: https://github.com/BuilderIO/builder/pull/3310/files#diff-6293c2a27254fa850a123075284412ef86d270a4518e0ad3aad81132b590ea1cL311
- de5d272: Fix: expand Angular peer dependency from `^16.2.0` to `>=16.2.0`

## 0.0.3

### Patch Changes

- 1e78ffe: Feat: class properties state approach, removes plugins for complex inline JS bindings for angular, fixes reactivity, bindings & symbol

## 0.0.2

### Patch Changes

- c2539c9: Fix: overall block styles

## 0.0.1

### Patch Changes

- fef9ba0: Initial alpha release.
