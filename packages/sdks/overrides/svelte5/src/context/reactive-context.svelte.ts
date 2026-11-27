import { toStore, type Readable } from 'svelte/store';
import type { BuilderContent } from '../types/builder-content.js';
import type { Signal } from '../types/signal.js';
import type { BuilderContextInterface, BuilderRenderState } from './types.js';

export type ReactiveBuilderContext = Signal<BuilderContextInterface>;

const KEYS: (keyof BuilderContextInterface)[] = [
  'content',
  'context',
  'rootState',
  'rootSetState',
  'localState',
  'apiKey',
  'apiVersion',
  'componentInfos',
  'inheritedStyles',
  'BlocksWrapper',
  'BlocksWrapperProps',
  'nonce',
  'model',
  'canTrack',
];

/**
 * Adds the store contract (`subscribe`) and `.value` to a context object, so the same object works
 * with runes (`ctx.rootState.x`, fine-grained) and with `$ctx` in Svelte 4-style components.
 */
function withStore<T extends object>(ctx: T, track: () => void): T & Readable<T> & { value: T } {
  let store: Readable<T> | undefined;
  Object.defineProperty(ctx, 'subscribe', {
    enumerable: false,
    value: (run: (value: T) => void, invalidate?: () => void) => {
      // A store subscriber wants to hear about any change: track the whole state deeply.
      store ??= toStore(() => (track(), ctx));
      return store.subscribe(run, invalidate);
    },
  });
  Object.defineProperty(ctx, 'value', { enumerable: false, get: () => ctx });
  return ctx as T & Readable<T> & { value: T };
}

/**
 * The root Builder context of one `<Content>`.
 *
 * - `rootState` is deep `$state`: a binding, text template or repeat that reads `state.count`
 *   re-runs when `count` changes, and nothing else does. Actions and `jsCode` write through the
 *   evaluator's proxy straight into it, so `rootSetState` is only needed to replace it wholesale.
 * - `content` is `$state.raw`: it is large, immutable during render, and replaced as a whole (a new
 *   entry, an editor update), so it is never deep-proxied.
 */
export function createBuilderContext(
  init: Omit<BuilderContextInterface, 'rootSetState' | 'localState'>
): ReactiveBuilderContext {
  let content = $state.raw<BuilderContent | null | undefined>(init.content);
  let rootState = $state<BuilderRenderState>(init.rootState);
  // Read lazily: only the editor needs the serialized component infos.
  let componentInfos: BuilderContextInterface['componentInfos'] | undefined;

  const rootSetState = (next: BuilderRenderState) => {
    if (next !== rootState) rootState = next;
  };

  const ctx = {
    get content() {
      return content;
    },
    set content(value) {
      content = value;
    },
    get rootState() {
      return rootState;
    },
    set rootState(value) {
      rootState = value;
    },
    rootSetState,
    localState: undefined,
    context: init.context,
    apiKey: init.apiKey,
    apiVersion: init.apiVersion,
    get componentInfos() {
      return (componentInfos ??= init.componentInfos);
    },
    set componentInfos(value) {
      componentInfos = value;
    },
    inheritedStyles: init.inheritedStyles,
    BlocksWrapper: init.BlocksWrapper,
    BlocksWrapperProps: init.BlocksWrapperProps,
    nonce: init.nonce,
    model: init.model,
    canTrack: init.canTrack,
  } satisfies BuilderContextInterface;

  return withStore(ctx, () => {
    void content;
    $state.snapshot(rootState);
  }) as ReactiveBuilderContext;
}

/**
 * A context that reads through to `getParent()` except for `overrides` (a repeat item's
 * `localState`). Reading through keeps it live: when the parent's content or state changes, so does
 * this one, without re-creating it, so `setContext` at mount stays correct.
 */
export function deriveContext(
  getParent: () => BuilderContextInterface,
  getOverrides: () => Partial<BuilderContextInterface>
): ReactiveBuilderContext {
  const ctx = {} as BuilderContextInterface;
  for (const key of KEYS) {
    Object.defineProperty(ctx, key, {
      enumerable: true,
      get: () => {
        const overrides = getOverrides();
        return key in overrides ? overrides[key] : getParent()[key];
      },
    });
  }
  return withStore(ctx, () => {
    for (const key of KEYS) void ctx[key];
    $state.snapshot(ctx.rootState);
  }) as ReactiveBuilderContext;
}
