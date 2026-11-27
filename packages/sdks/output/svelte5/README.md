# Builder.io SDK for Svelte 5 (prototype)

> **Prototype.** Working name `@builder.io/sdk-svelte5`; the intended release is the next major of
> `@builder.io/sdk-svelte` (Svelte 5 only), with the current 5.x line staying on Svelte 4.

The same public API as `@builder.io/sdk-svelte` (`Content`, `Blocks`, the built-in blocks,
`fetchOneEntry`, `isEditing`, `isPreviewing`, `register`, …), built for Svelte 5:

- **Runes throughout.** No `export let`, `$:`, stores, `<slot>`, `svelte:component` or `on:`
  directives. The SDK compiles under `compilerOptions.runes: true`, so apps can force runes for
  every component, dependencies included.
- **Async mode.** Works with `compilerOptions.experimental.async: true`; custom components can
  `await` in their script and markup.
- **Snippets.** Custom components receive their child blocks as the `children` snippet
  (`{@render children?.()}`); Svelte 4-style components still get them as the default slot.
- **Event attributes.** Block actions arrive as `onclick`, `onmouseenter`, … in `attributes`, so a
  `noWrap` component spreads `{...attributes}` onto its root and is done: no `use:` action.
- **A reactive `builderContext`.** Read it directly in runes (`builderContext.rootState.count`,
  fine-grained) or as a store in Svelte 4-style components (`$builderContext.rootState.count`).
- **`Component` types.** `customComponents` accepts runes components (`Component<Props>`),
  legacy components, and `{ load, fallback }` for lazy ones.

## How it is built

There is no Mitosis compilation for this target. `scripts/sync-src.mjs` builds `src/`:

1. copies the framework-agnostic TypeScript from `packages/sdks/src` (fetching, evaluation, tracking,
   editor protocol, CSS, A/B tests, personalization), so that logic stays shared with every SDK;
2. points each `*.lite.jsx` import at the hand-written Svelte 5 component of the same name;
3. overlays `packages/sdks/overrides/svelte5/src` (the components and a few target files).

Then `svelte-package` emits `lib/{node,edge,browser}`, exactly like `@builder.io/sdk-svelte`.

## Rendering design

- **One component per block**, not nine. Per-block values are `$derived`; the markup branches are
  snippets. Styles and wrappers are plain functions.
- **Fine-grained state.** Root state is deep `$state`. A block without bindings reads no state, so
  state changes never touch it; a bound block re-runs only when the keys its bindings read change.
  Content is `$state.raw` (large, replaced as a whole, never deep-proxied).
- **The editor bridge is lazy.** Everything the visual editor and preview links need is loaded with a
  dynamic `import()` only inside Builder.
- **In the editor, a throwing custom component** empties only its own block (`<svelte:boundary>`).

## Prototype numbers

Same app and synthetic production-shaped pages for both SDKs, both compiled with Svelte 5.59
(the current SDK in legacy mode, as Svelte 5 apps run it today). Apple Silicon, Node 22,
headless Chromium; medians.

| | `@builder.io/sdk-svelte` 5.4.8 | this SDK |
| --- | ---: | ---: |
| SSR, 4-root landing page | 6.0 ms, 16.9 MB allocated | 1.9 ms, 5.2 MB |
| SSR, 1,000 flat blocks | 114 ms, 70.7 MB | 11.8 ms, 14.9 MB |
| SSR, 100 levels deep | 6.2 ms, 13.0 MB | 1.0 ms, 2.6 MB |
| Hydrate landing (1× / 4× CPU) | 76 / 330 ms | 26 / 96 ms |
| Hydrate 1,000 flat blocks (1× / 4× CPU) | 190 / 789 ms | 37 / 126 ms |
| Root state change no block reads (landing, 1× / 4× CPU) | 32 / 153 ms | ~0 ms |
| Client JS of the test app (gzip) | 67.4 KB | 63.7 KB |
| Components compiling under `runes: true` | 3 of 44 | 27 of 27 |

Shared e2e suite (`SERVER_NAME=sveltekit-svelte5`): 209 passed. The remaining failures also fail
or flake against the current SDK in the same environment (link component, one editor test,
accordion / dynamic-loading timing).

## Develop

```sh
yarn workspace @builder.io/sdk-svelte5 build
yarn workspace @e2e/sveltekit-svelte5 build
cd packages/sdks-tests && SERVER_NAME=sveltekit-svelte5 yarn test:e2e:bare
```
