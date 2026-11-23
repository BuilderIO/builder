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
 * element. The element lives in the host of `subscribers[0]`; when that
 * instance is destroyed it is moved to the next subscriber so the CSS stays in
 * the document for as long as anyone still needs it.
 */
interface SharedStyle {
  el: HTMLStyleElement;
  subscribers: InlinedStyles[];
}

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
      existing.subscribers.push(this);
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
      this.renderer.removeChild(this.elRef.nativeElement, shared.el);
      return;
    }

    if (index === 0) {
      // We held the element; hand it to the next instance still using it.
      this.renderer.appendChild(
        shared.subscribers[0].elRef.nativeElement,
        shared.el
      );
    }
  }

  private createStyle(styles: string): HTMLStyleElement {
    const el = this.renderer.createElement('style');
    this.renderer.setAttribute(el, 'data-id', this.id());
    this.renderer.appendChild(el, this.renderer.createText(styles));
    this.renderer.setAttribute(el, 'nonce', this.nonce());
    this.renderer.appendChild(this.elRef.nativeElement, el);
    return el;
  }

  /**
   * After SSR + hydration the host may already contain the `<style>` the
   * server emitted. Reuse it instead of appending a second copy.
   */
  private adoptServerStyle(styles: string): HTMLStyleElement | undefined {
    const host: HTMLElement | undefined = this.elRef.nativeElement;
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
