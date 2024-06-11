import { CommonModule } from '@angular/common';
// fails because type imports cannot be injected
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { Component, Input, Renderer2 } from '@angular/core';

interface Props {
  scriptStr: string;
  id: string;
}

@Component({
  selector: 'inlined-script, InlinedScript',
  template: ``,
  standalone: true,
  imports: [CommonModule],
})
export default class InlinedScript {
  @Input() scriptStr!: Props['scriptStr'];
  @Input() id!: Props['id'];

  constructor(private renderer: Renderer2) {}

  ngOnInit() {
    const script = this.renderer.createElement('script');
    script.innerHTML = this.scriptStr;
    this.renderer.setAttribute(script, 'data-id', this.id);
    this.renderer.appendChild(document.body, script);
  }
}
