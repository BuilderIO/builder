/**
 * Svelte context key for the Builder context. `getContext(BuilderContext.key)` returns the same
 * reactive context custom components receive as `builderContext` (see `types/signal.ts`).
 */
const key = Symbol.for('builder.io:context');

export default { key };
