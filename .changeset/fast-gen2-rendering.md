---
"@builder.io/sdk-angular": patch
"@builder.io/sdk-react-nextjs": patch
"@builder.io/sdk-qwik": patch
"@builder.io/sdk-react": patch
"@builder.io/sdk-react-native": patch
"@builder.io/sdk-solid": patch
"@builder.io/sdk-svelte": patch
"@builder.io/sdk-vue": patch
---

Faster rendering, and rendering no longer mutates the content object:

- Blocks without bindings are processed once per block and locale instead of on every render; localized values are resolved without modifying the content (fixes the wrong locale showing when the same content object is rendered with a different `locale`).
- Bindings are applied copy-on-write instead of deep-cloning the block.
- Content state (`data.state`, input defaults) is copied per render, so state writes can no longer leak into a cached content object.
- The component registry is built once per registration instead of on every `Content`/`Symbol` render.
- Node: `isolated-vm` evaluations reuse a periodically recycled isolate (fresh context per evaluation) with cached scripts, and pure state expressions over plain data (e.g. `!state.open`, `state.$index + 1`) skip the sandbox; expressions that would read getters or class instances still run in it.
- Browser: binding functions are compiled once per code string.
- Compiled-expression and path caches are bounded and evict the oldest entry instead of clearing; the processed-block cache keeps only the latest locale per block.
- `set` and `setCopyOnWrite` ignore paths containing `__proto__`, `constructor` or `prototype`.
- Node: `jsCode` that sets state with `Object.assign(state, {...})` or assigns functions to state no longer throws inside `isolated-vm`; function values are skipped on the server.
