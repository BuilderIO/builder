import { CommonModule } from '@angular/common';
// fails because type imports cannot be injected
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { Component, Input, Renderer2 } from '@angular/core';

interface Props {
  styles: string;
  id: string;
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

  constructor(private renderer: Renderer2) {}

  ngOnInit() {
    const style = this.renderer.createElement('style');
    this.renderer.setAttribute(style, 'data-id', this.id);
    this.renderer.appendChild(style, this.renderer.createText(this.styles));
    this.renderer.appendChild(document.head, style);
  }
}
