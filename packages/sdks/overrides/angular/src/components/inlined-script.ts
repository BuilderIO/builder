import { CommonModule } from '@angular/common';
// fails because type imports cannot be injected
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import {
  Component,
  ElementRef,
  Inject,
  Input,
  PLATFORM_ID,
  Renderer2,
} from '@angular/core';

interface Props {
  scriptStr: string;
  id: string;
  nonce: string;
}

@Component({
  selector: 'inlined-script, InlinedScript',
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
export default class InlinedScript {
  @Input() scriptStr!: Props['scriptStr'];
  @Input() id!: Props['id'];
  @Input() nonce!: Props['nonce'];

  constructor(
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) private platformId: any,
    private elRef: ElementRef
  ) {}

  ngOnInit() {
    const script = this.renderer.createElement('script');
    script.text = this.scriptStr;
    this.renderer.setAttribute(script, 'data-id', this.id);
    this.renderer.setAttribute(script, 'nonce', this.nonce);
    this.renderer.appendChild(this.elRef.nativeElement, script);
  }
}
