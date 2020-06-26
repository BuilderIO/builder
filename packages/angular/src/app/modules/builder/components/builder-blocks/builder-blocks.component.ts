import {
  Component,
  HostBinding,
  HostListener,
  Input,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Builder, GetContentOptions } from '@builder.io/sdk';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BuilderService } from '../../services/builder.service';

@Component({
  selector: 'builder-blocks',
  templateUrl: './builder-blocks.component.html',
  styleUrls: ['./builder-blocks.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuilderBlocksComponent implements OnInit {
  @Input() blocks: any;

  @Input() child = false;
  @Input() prerender = true;
  @Input() model = '';
  @Input() key = '';

  @Input() options: GetContentOptions | null = null;

  // @deprecated
  @Input() field = '';

  constructor(private domSanitizer: DomSanitizer, private builder: BuilderService) {}

  private lastInnerHtml = '';
  private lastInnerHtmlSanitized: SafeHtml | null = null;

  ngOnInit() {
    if (this.builder.editingModel) {
      // TODO: allow replacing
    }
  }

  // @HostBinding('class.no-children')
  get hasNoChildren() {
    return !(this.blocks && (this.blocks.length || this.blocks.html));
  }

  // @HostListener('click')
  // onClick() {
  //   if (Builder.isIframe && this.hasNoChildren) {
  //     window.parent.postMessage(
  //       {
  //         type: 'builder.clickEmptyBlocks',
  //       },
  //       '*'
  //     );
  //   }
  // }

  get arrayBlocks() {
    return Array.isArray(this.blocks);
  }

  get innerHtml() {
    const html = this._innerHtml;
    if (html === this.lastInnerHtml) {
      return this.lastInnerHtmlSanitized || '';
    }

    this.lastInnerHtml = html;
    this.lastInnerHtmlSanitized = this.domSanitizer.bypassSecurityTrustHtml(html);

    return this.lastInnerHtmlSanitized;
  }

  get _innerHtml() {
    if (!this.prerender || this.arrayBlocks || !this.blocks || !this.blocks.html) {
      return '';
    }

    const css = this.blocks.css;
    let html = this.blocks.html;
    if (css) {
      html = `<style class="builder-styles">${css}</style>` + html;
    }

    return html;
  }

  trackByFn(index: number, value: any) {
    // TODO: possibly json-stable-stringify
    return value.id || (value.component && value.component.id) || JSON.stringify(value);
  }
}
