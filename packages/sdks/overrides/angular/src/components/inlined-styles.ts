import { CommonModule, DOCUMENT } from '@angular/common';
// fails because type imports cannot be injected
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { Component, ElementRef, Inject, input, Renderer2 } from '@angular/core';

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
}

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
const REGISTRIES = new WeakMap<object, Map<string, SharedStyle>>();

const getRegistry = (doc: object): Map<string, SharedStyle> => {
  let registry = REGISTRIES.get(doc);
  if (!registry) {
    registry = new Map();
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

  private key: string | undefined;

  constructor(
    private renderer: Renderer2,
    private elRef: ElementRef,
    @Inject(DOCUMENT) private document: Document
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
    const styles = this.styles();
    if (!styles) return;

    const key = `${this.id()}\u0000${styles}`;
    const registry = getRegistry(this.document);
    this.key = key;

    const existing = registry.get(key);
    if (existing) {
      if (precedes(this.host, existing.subscribers[0].host)) {
        // We render before the current holder, so the style belongs here.
        existing.subscribers.unshift(this);
        this.renderer.appendChild(this.host, existing.el);
      } else {
        existing.subscribers.push(this);
      }
      return;
    }

    registry.set(key, {
      el: this.adoptServerStyle(styles) ?? this.createStyle(styles),
      subscribers: [this],
    });
  }

  private release() {
    const key = this.key;
    if (key === undefined) return;
    this.key = undefined;

    const registry = getRegistry(this.document);
    const shared = registry.get(key);
    if (!shared) return;

    const index = shared.subscribers.indexOf(this);
    if (index === -1) return;
    shared.subscribers.splice(index, 1);

    if (shared.subscribers.length === 0) {
      registry.delete(key);
      this.renderer.removeChild(this.host, shared.el);
      return;
    }

    if (index === 0) {
      // We held the element; hand it to the earliest instance still using it.
      let earliest = 0;
      for (let i = 1; i < shared.subscribers.length; i++) {
        if (
          precedes(
            shared.subscribers[i].host,
            shared.subscribers[earliest].host
          )
        ) {
          earliest = i;
        }
      }
      const [holder] = shared.subscribers.splice(earliest, 1);
      shared.subscribers.unshift(holder);
      this.renderer.appendChild(holder.host, shared.el);
    }
  }

  private get host(): HTMLElement {
    return this.elRef.nativeElement;
  }

  private createStyle(styles: string): HTMLStyleElement {
    const el = this.renderer.createElement('style');
    this.renderer.setAttribute(el, 'data-id', this.id());
    this.renderer.appendChild(el, this.renderer.createText(styles));
    this.renderer.setAttribute(el, 'nonce', this.nonce());
    this.renderer.appendChild(this.host, el);
    return el;
  }

  /**
   * After SSR + hydration the host may already contain the `<style>` the
   * server emitted. Reuse it instead of appending a second copy.
   */
  private adoptServerStyle(styles: string): HTMLStyleElement | undefined {
    const host: HTMLElement | undefined = this.host;
    const children = host?.children;
    if (!children) return undefined;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (
        child.tagName === 'STYLE' &&
        child.getAttribute('data-id') === this.id() &&
        child.textContent === styles
      ) {
        return child as HTMLStyleElement;
      }
    }
    return undefined;
  }
}
