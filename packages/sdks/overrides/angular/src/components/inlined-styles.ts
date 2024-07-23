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

  constructor(
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnChanges() {
    const style = this.renderer.createElement('style');
    this.renderer.setAttribute(style, 'data-id', this.id);
    this.renderer.appendChild(style, this.renderer.createText(this.styles));
    this.renderer.setAttribute(style, 'nonce', this.nonce);
    this.renderer.appendChild(this.document.head, style);
  }
}
