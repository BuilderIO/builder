import { CommonModule, DOCUMENT } from '@angular/common';
// fails because type imports cannot be injected
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { Component, Inject, Input, Renderer2 } from '@angular/core';

interface Props {
  styles: string;
  id: string;
  nonce: string;
}

@Component({
  selector: 'inlined-styles, InlinedStyles',
  template: ``,
  standalone: true,
  imports: [CommonModule],
})
export default class InlinedStyles {
  @Input() styles!: Props['styles'];
  @Input() id!: Props['id'];
  @Input() nonce!: Props['nonce'];

  styleElement!: HTMLStyleElement;

  constructor(
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnChanges(changes) {
    if (changes.styles) {
      if (this.styleElement) {
        this.styleElement.textContent = this.styles;
      } else {
        this.styleElement = this.renderer.createElement('style');
        this.renderer.setAttribute(this.styleElement, 'data-id', this.id);
        this.renderer.appendChild(
          this.styleElement,
          this.renderer.createText(this.styles)
        );
        this.renderer.setAttribute(this.styleElement, 'nonce', this.nonce);
        this.renderer.appendChild(this.document.head, this.styleElement);
      }
    }
  }
}
