import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
// fails because type imports cannot be injected
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import {
  afterNextRender,
  Component,
  ElementRef,
  Inject,
  Injector,
  input,
  PLATFORM_ID,
  Renderer2,
} from '@angular/core';

interface Props {
  styles: string;
  id: string;
  nonce: string;
}

/**
 * Every `InlinedStyles` instance that wants the same CSS shares one `<style>`
 * element. The element lives in the host of `subscribers[0]`, which is kept as
 * the subscriber that comes first in document order. That way the element sits
 * exactly where a fresh render of the current instances would put it, so its
 * cascade position relative to other styles stays stable when instances are
 * added, removed, or change their CSS.
 */
interface SharedStyle {
  el: HTMLStyleElement;
  subscribers: InlinedStyles[];
  /** The subscriber whose `afterNextRender` will re-check the order, if any. */
  reorderOwner?: InlinedStyles;
}

/**
 * Tracks the CSS emitted for one selector. If the same kind of style (same
 * `data-id`) ever produces two different CSS texts for one selector (e.g. a
 * repeated block whose styles are bound to item data), dropping a later
 * duplicate could let a different variant win the cascade (A, B, A would
 * become A, B). Such selectors are not shared: every instance keeps its own
 * `<style>`, as before deduplication.
 */
interface SelectorState {
  /** Instances (shared or not) currently emitting CSS for this selector. */
  count: number;
  /**
   * The shared key per `data-id` for this selector, or `null` once conflicting
   * CSS has been seen. Holds at most one entry per `data-id`, and the whole
   * state is dropped when `count` reaches zero.
   */
  keysByDataId: Map<string, string> | null;
}

interface DocumentStyles {
  /** Shared `<style>` elements, keyed by `${data-id}\0${css}`. */
  shared: Map<string, SharedStyle>;
  selectors: Map<string, SelectorState>;
}

/**
 * Only styles whose CSS the SDK generates from a block id are shared: block
 * styles (`.${blockId} { ... }`, in media queries, plus `:hover`) and columns
 * styles (`.${blockId}-breakpoints ...`). Their first class selector reliably
 * identifies what they target. Other styles (e.g. a content entry's custom
 * `cssCode`) can target anything, so they always keep their own `<style>`.
 */
const SHAREABLE_DATA_IDS = new Set(['builderio-block', 'builderio-columns']);

const getShareableSelector = (
  dataId: string,
  styles: string
): string | undefined => {
  if (!SHAREABLE_DATA_IDS.has(dataId)) return undefined;
  return /\.([^\s{},:>~+]+)/.exec(styles)?.[1];
};

// Node.DOCUMENT_POSITION_* bit flags; `Node` is not a global during SSR.
const DOCUMENT_POSITION_DISCONNECTED = 0x01;
const DOCUMENT_POSITION_PRECEDING = 0x02;

/**
 * Whether `a` is earlier in the document than `b`. Returns false when the order
 * cannot be determined (e.g. a host that is not attached yet).
 */
const precedes = (a: Node, b: Node): boolean => {
  if (typeof b?.compareDocumentPosition !== 'function') return false;
  const position = b.compareDocumentPosition(a);
  if (position & DOCUMENT_POSITION_DISCONNECTED) return false;
  return Boolean(position & DOCUMENT_POSITION_PRECEDING);
};

/**
 * Keyed by `Document` so that each SSR request (which gets its own document)
 * has an isolated registry and nothing leaks between requests.
 */
const REGISTRIES = new WeakMap<object, DocumentStyles>();

const getRegistry = (doc: object): DocumentStyles => {
  let registry = REGISTRIES.get(doc);
  if (!registry) {
    registry = { shared: new Map(), selectors: new Map() };
    REGISTRIES.set(doc, registry);
  }
  return registry;
};

/**
 * Symbols and repeated blocks render the same block ids, so each instance
 * produces byte-identical CSS. Rather than emitting one `<style>` per instance,
 * only the first instance with a given (id, css) pair emits it; the rest
 * reuse that element.
 *
 * Dedupe is by exact CSS text, not block id: bindings can make blocks with the
 * same id produce different CSS, and those must still all be emitted.
 */
@Component({
  selector: 'inlined-styles, InlinedStyles',
  template: ``,
  standalone: true,
  imports: [CommonModule],
  styles: [
    `
      :host {
        display: contents;
      }
    `,
  ],
})
export default class InlinedStyles {
  styles = input.required<Props['styles']>();
  id = input.required<Props['id']>();
  nonce = input.required<Props['nonce']>();

  /**
   * What we last acquired. Inputs may already hold their new values when we
   * release, so release and unshare use these instead.
   */
  private acquired:
    | { dataId: string; css: string; selector: string | undefined }
    | undefined;
  /** Key of the shared entry we subscribe to, if any. */
  private key: string | undefined;
  /** Our own, unshared `<style>`, if we are not sharing. */
  private ownEl: HTMLStyleElement | undefined;

  constructor(
    private renderer: Renderer2,
    private elRef: ElementRef,
    private injector: Injector,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnChanges(changes) {
    if (changes.styles || changes.id) {
      this.release();
      this.acquire();
    }
  }

  ngOnDestroy() {
    this.release();
  }

  private acquire() {
    const css = this.styles();
    // Whitespace-only CSS (e.g. a block with no styles) has no effect.
    if (!css?.trim()) return;

    const dataId = this.id();
    const registry = getRegistry(this.document);
    const selector = getShareableSelector(dataId, css);
    this.acquired = { dataId, css, selector };

    // A matching <style> the server rendered into our host, if hydrating.
    const serverStyle = this.findServerStyle(dataId, css);

    if (selector === undefined) {
      this.ownEl = serverStyle ?? this.createStyle(dataId, css);
      return;
    }

    const key = `${dataId}\u0000${css}`;
    let state = registry.selectors.get(selector);
    if (!state) {
      state = { count: 0, keysByDataId: new Map() };
      registry.selectors.set(selector, state);
    }
    state.count++;

    if (state.keysByDataId) {
      const seen = state.keysByDataId.get(dataId);
      if (seen === undefined) {
        state.keysByDataId.set(dataId, key);
      } else if (seen !== key) {
        // Conflicting CSS for this selector: stop sharing any of it.
        const toUnshare = Array.from(state.keysByDataId.values());
        state.keysByDataId = null;
        toUnshare.forEach((sharedKey) => this.unshare(registry, sharedKey));
      }
    }

    if (!state.keysByDataId) {
      this.ownEl = serverStyle ?? this.createStyle(dataId, css);
      return;
    }

    this.key = key;
    const shared = registry.shared.get(key);
    if (!shared) {
      registry.shared.set(key, {
        el: serverStyle ?? this.createStyle(dataId, css),
        subscribers: [this],
      });
      return;
    }

    shared.subscribers.push(this);
    if (serverStyle && serverStyle !== shared.el) {
      // The registry already tracks a copy of this CSS, so ours is redundant.
      // If we turn out to be the earliest instance (out-of-order hydration),
      // the tracked copy is moved into our host below.
      this.removeStyle(serverStyle);
    }
    this.scheduleReorder(shared);
  }

  private release() {
    const acquired = this.acquired;
    if (!acquired) return;
    this.acquired = undefined;
    const registry = getRegistry(this.document);

    if (this.ownEl) {
      this.removeStyle(this.ownEl);
      this.ownEl = undefined;
    }

    const selectorState =
      acquired.selector === undefined
        ? undefined
        : registry.selectors.get(acquired.selector);
    if (selectorState && --selectorState.count <= 0) {
      registry.selectors.delete(acquired.selector!);
    }

    const key = this.key;
    if (key === undefined) return;
    this.key = undefined;

    const shared = registry.shared.get(key);
    if (!shared) return;

    const index = shared.subscribers.indexOf(this);
    if (index === -1) return;
    shared.subscribers.splice(index, 1);

    if (shared.reorderOwner === this) {
      // Our pending callback is dropped with us; let a survivor re-check.
      shared.reorderOwner = undefined;
      if (shared.subscribers.length > 1) {
        shared.subscribers[0].scheduleReorder(shared);
      }
    }

    if (shared.subscribers.length === 0) {
      registry.shared.delete(key);
      this.removeStyle(shared.el);
      // This variant is gone, so a different one later is not a conflict.
      if (selectorState?.keysByDataId?.get(acquired.dataId) === key) {
        selectorState.keysByDataId.delete(acquired.dataId);
      }
      return;
    }

    if (index === 0) {
      // We held the element; hand it to the earliest instance still using it.
      // The remaining hosts are attached here, so their order is known.
      this.moveToEarliest(shared, true);
    }
  }

  /**
   * Turn a shared entry back into one `<style>` per subscriber, each in its own
   * host, which restores the original (non-deduplicated) cascade order.
   */
  private unshare(registry: DocumentStyles, key: string) {
    const shared = registry.shared.get(key);
    if (!shared) return;
    registry.shared.delete(key);
    shared.reorderOwner = undefined;

    shared.subscribers.forEach((subscriber, i) => {
      subscriber.key = undefined;
      const { dataId, css } = subscriber.acquired!;
      subscriber.ownEl =
        i === 0 ? shared.el : subscriber.createStyle(dataId, css);
    });
  }

  /**
   * Hosts are not attached to the document yet when `ngOnChanges` runs, so the
   * document order of a new subscriber is only known after rendering. Re-check
   * then, in the browser, before the frame is painted.
   */
  private scheduleReorder(shared: SharedStyle) {
    if (shared.reorderOwner || !isPlatformBrowser(this.platformId)) return;
    shared.reorderOwner = this;
    try {
      afterNextRender(
        () => {
          if (shared.reorderOwner !== this) return;
          shared.reorderOwner = undefined;
          if (shared.subscribers.length > 1) {
            this.moveToEarliest(shared, false);
          }
        },
        { injector: this.injector }
      );
    } catch {
      // Our injector is already destroyed (the view is being torn down).
      shared.reorderOwner = undefined;
    }
  }

  /**
   * Make the earliest subscriber in document order the holder, moving the
   * shared element into its host if needed.
   */
  private moveToEarliest(shared: SharedStyle, holderChanged: boolean) {
    const { subscribers } = shared;
    let earliest = 0;
    for (let i = 1; i < subscribers.length; i++) {
      if (precedes(subscribers[i].host, subscribers[earliest].host)) {
        earliest = i;
      }
    }
    if (earliest === 0 && !holderChanged) return;

    const [holder] = subscribers.splice(earliest, 1);
    subscribers.unshift(holder);
    this.renderer.appendChild(holder.host, shared.el);
  }

  private removeStyle(el: HTMLStyleElement) {
    const parent = this.renderer.parentNode(el);
    if (parent) this.renderer.removeChild(parent, el);
  }

  private get host(): HTMLElement {
    return this.elRef.nativeElement;
  }

  private createStyle(dataId: string, css: string): HTMLStyleElement {
    const el = this.renderer.createElement('style');
    this.renderer.setAttribute(el, 'data-id', dataId);
    this.renderer.appendChild(el, this.renderer.createText(css));
    this.renderer.setAttribute(el, 'nonce', this.nonce());
    this.renderer.appendChild(this.host, el);
    return el;
  }

  /**
   * After SSR + hydration the host may already contain the `<style>` the
   * server emitted. Returns it so it can be reused (or removed if redundant).
   */
  private findServerStyle(
    dataId: string,
    css: string
  ): HTMLStyleElement | undefined {
    const host: HTMLElement | undefined = this.host;
    const children = host?.children;
    if (!children) return undefined;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (
        child.tagName === 'STYLE' &&
        child.getAttribute('data-id') === dataId &&
        child.textContent === css
      ) {
        return child as HTMLStyleElement;
      }
    }
    return undefined;
  }
}
