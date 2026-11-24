import type { Readable } from 'svelte/store';

/**
 * The reactive Builder context handed to custom components (`builderContext`) and to `<Blocks>`.
 *
 * - Runes: read it directly, it is fine-grained (`builderContext.rootState.count`).
 * - Svelte 4-style components: it is also a store (`$builderContext.rootState.count`).
 * - `.value` returns the context itself, for code written against the Mitosis `Signal` shape.
 */
export type Signal<T> = T & Readable<T> & { readonly value: T };
