import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
// fails because type imports cannot be injected
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import {
  Component,
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
})
export default class InlinedScript {
  @Input() scriptStr!: Props['scriptStr'];
  @Input() id!: Props['id'];
  @Input() nonce!: Props['nonce'];

  constructor(
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: string
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const script = this.renderer.createElement('script');
      script.innerHTML = this.scriptStr;
      this.renderer.setAttribute(script, 'data-id', this.id);
      this.renderer.setAttribute(script, 'nonce', this.nonce);
      this.renderer.appendChild(this.document.body, script);
    }
  }
}
