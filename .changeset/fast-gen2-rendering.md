---
"@builder.io/sdk-angular": patch
"@builder.io/sdk-react-nextjs": patch
"@builder.io/sdk-qwik": patch
"@builder.io/sdk-react": minor
"@builder.io/sdk-react-native": minor
"@builder.io/sdk-solid": minor
"@builder.io/sdk-svelte": minor
"@builder.io/sdk-vue": minor
---

Faster rendering, and rendering no longer mutates the content object:

- Blocks without bindings are processed once per block and locale instead of on every render; localized values are resolved without modifying the content (fixes the wrong locale showing when the same content object is rendered with a different `locale`).
- Bindings are applied copy-on-write instead of deep-cloning the block.
- The component registry is built once per registration instead of on every `Content`/`Symbol` render.
- Node: `isolated-vm` evaluations reuse a periodically recycled isolate (fresh context per evaluation) with cached scripts, and pure state expressions over plain data (e.g. `!state.open`, `state.$index + 1`) skip the sandbox; expressions that would read getters or class instances still run in it.
- Browser: binding functions are compiled once per code string.
- Compiled-expression and path caches are bounded and evict the oldest entry instead of clearing; the processed-block cache keeps only the latest locale per block.
- Node: `jsCode` that sets state with `Object.assign(state, {...})` no longer throws inside `isolated-vm`, and nested state writes (`state.user.name = ...`) and `delete state.x` update root state at the full path instead of writing a stray top-level key.

Behavior changes. These fix bugs, but code that relied on the old behavior will see a difference:

- Content state (`data.state`, input defaults) is copied per render, so state written during a render no longer appears on the content object you passed in, and can no longer leak into a cached content object.
- Node: writes and deletes on `context`, `builder` and `event` in `jsCode` no longer reach root state.
- Node: function values assigned to state in `jsCode` are skipped on the server instead of throwing.
- `set`, `setCopyOnWrite` and `unset` follow only own properties and use the same path rule: `__proto__` is never allowed, and `constructor`/`prototype` only as the final key.
- The default `.builder-button` reset now has zero specificity (`:where(.builder-button)`), so a button's own block styles win even when a later `Content` on the page emits the reset after them. Global `button` rules in your own CSS now also apply to Builder buttons.
