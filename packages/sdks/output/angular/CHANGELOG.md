# @builder.io/sdk-angular

## 0.18.7

### Patch Changes

- 4eaad61: Refactor: code changes for the new blocks getting added on the top fix, adds thorough comments and uses mitosis's compileContext to introduce the `ngAfterContentChecked` hook
- b38c8fb: Fix: show the correct A/B test variant content while visual editing or toggling between variants

## 0.18.6

### Patch Changes

- f4ff27d: Fix: crashes when visually editing blocks (encountered when SDK dynamically switched HTML elements)
- 6eb90b3: Fix: new blocks getting added at the top while visual editing

## 0.18.5

### Patch Changes

- 02fab2b: Fix: handle the rendering of unknown HTML elements.

## 0.18.4

### Patch Changes

- 887c6e0: Fix: visual editing Custom Code block reflects code updates in real time
- 887c6e0: Fix: `nativeElement` not found issue in Custom Code and Embed Blocks

## 0.18.3

### Patch Changes

- 527c115: Feat: A/B tests support

## 0.18.2

### Patch Changes

- 1396fb4: Fix: duplicate `/track` call validation handles default and variant scenarios correctly.

## 0.18.1

### Patch Changes

- 80247eb: Fix: Updating input values while in the Content Editor not triggering changes in the iframe.

## 0.18.0

### Minor Changes

- 5ed08fc: - BREAKING CHANGE 🧨 : updated `subscribeToEditor` arguments: - arguments are now passed as a named argument object - `apiKey` is now a required field

Example:

- from:

```ts
    subscribeToEditor('page', () => { ... }, options: {trustedHosts:['...']})
```

- to:

```ts
    subscribeToEditor({
        apiKey: '...',
        model: '...',
        trustedHosts: ['...'],
        callback: () => { ... }
    })
```

- 10a5754: BREAKING CHANGE 🧨: `model` and `content` are now required props for `<Content>`.

## 0.17.9

### Patch Changes

- 58ee59e: Fix: added lazy loading to video element

## 0.17.8

### Patch Changes

- 7d01119: feat: Add support for `xsmall` additional breakpoint.

## 0.17.7

### Patch Changes

- abe5cba: Feat: exports `setClientUserAttributes` helper that can be used to set and update Builder's user attributes cookie. This cookie is used by Builder's Personalization Containers to decide which variant to render.

  Usage example:

  ```ts
  import { setClientUserAttributes } from "@builder.io/sdk-angular";

  setClientUserAttributes({
    device: "tablet",
  });
  ```

## 0.17.6

### Patch Changes

- 91a7117: Fix: vertically aligning child block of columns block
- 2f73837: Fix: Removed z-index from Video block, which caused it to hide its children elements.

## 0.17.5

### Patch Changes

- 648c37f: Fix: support Builder's block animations.
- 3eb5b99: Fix: add `display: contents` to InlinedScript and InlinedStyles components so that they don't affect flex styles
- eb3d1af: Fix: Form block rendering children multiple times

## 0.17.4

### Patch Changes

- 84b6986: Fix: `@Input` not annotated errors in console
- e07fcf0: Fix: hydration errors in angular ssr v17+ apps by skipping hydration from Content level for now as Angular doesn't support hydrating elements created dynamically

## 0.17.3

### Patch Changes

- e9d9953: Fix: mark text as safe to remove the Angular stripping/warning message
- e9d9953: Fix: Embed and Custom Code block to support embedding iframes
- 306f8d5: Fix: add missing `folded` and `keysHelperText` types to custom component `Input`
- 306f8d5: Types: add `firstPublished` to BuilderContent
- bee361e: Fix: add `key` prop for loop inside Accordion Block.

## 0.17.2

### Patch Changes

- e0dc757: Fix: previewing content within the Studio tab of the Builder Visual Editor.
- b1bd65a: Fix: export types `RegisteredComponents` and `BuilderContextInterface`.
- b1bd65a: Move Text Block's inline bindings (e.g. `Hello {{state.name}}`) evaluation outside of component. This allows customers to use inline bindings in their custom Text Block implementations.
- b1bd65a: Remove noisy console log in edge runtime (for empty code block evaluation)

## 0.17.1

### Patch Changes

- 409aec9: Feat: add `meta` type to custom components
- 23b7594: Feat: extend allowed file types of Image and Video Block
- ee436bf: Fix: `locale` prop to automatically resolve localized fields
- 2fc9fc5: Fix: `onChange` functions passed to builder inputs can now receive async functions

## 0.17.0

### Minor Changes

- 78b8e5d: Breaking Change 🧨: `fetchEntries` and `fetchOneEntry` calls will now throw any errors thrown by `fetch`, or any non-success response returned from the Builder API.

  Previously, both functions would swallow all errors and return `null`.

## 0.2.27

### Patch Changes

- 9b11521: fix serializing single arg arrow functions that some compilers emit
- 027a07a: fix: standardize locale handling

## 0.2.26

### Patch Changes

- 5e88efa: Logs every API URL hit from the SDK whenever `process.env.DEBUG` is set to `true` in the project

## 0.2.25

### Patch Changes

- efa4798: Fix: accordion block order of items and visual editing empty blocks

## 0.2.24

### Patch Changes

- 067423d: Fix: builder children blocks not being ssred
- c2e7846: Fix: make Column block's state reactive to its `props`
- 067423d: Feat: supports `noWrap` for custom components

## 0.2.23

### Patch Changes

- 9da4f89: Feature: Adds `apiHost` prop to `Content`. It dictates which API endpoint is used for the content fetching. Defaults to 'https://cdn.builder.io'
- 185ee23: Fix: duplication of content in the Visual Editor when editing a symbol model that renders another symbol

## 0.2.22

### Patch Changes

- bfe9d7e: Misc: send SDK headers in API requests ( https://github.com/BuilderIO/builder/pull/3659 )

## 0.2.21

### Patch Changes

- e4253d6: Fix: accessing Builder Context within `Blocks` (regression from https://github.com/BuilderIO/builder/pull/3658)
- 3146ba3: Fix: optionally chain access to context value in Blocks
- c5dd946: Feature: adds a `className: string` prop to the `Blocks` component used to apply a class to the `div` that wraps each list of blocks.

## 0.2.20

### Patch Changes

- 4660aa6: Feature: optimize simple `state.*` read access bindings by avoiding runtime-specific eval, and instead fetching the value directly from the state

## 0.2.19

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

## 0.2.18

### Patch Changes

- 269db7b: Fix: execute JS code and make http requests on Content initialization (instead of "on mount")
- 269db7b: Various improvements to edge runtime interpreter:

  - Correctly handle code blocks with async/await polyfills (typically `jsCode` blocks)
  - Improve handling of getters and setters on `state` values

## 0.2.17

### Patch Changes

- 348de96: Fix: disable `initializeNodeRuntime()` on arm64 machines running node 20

## 0.2.16

### Patch Changes

- 4c43240: Fix: children placement in dynamic components

## 0.2.15

### Patch Changes

- 50778a4: types: export GetContentOptions

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
