import {
  Component,
  Input,
  ChangeDetectionStrategy,
  AfterViewInit,
  OnInit,
  OnChanges,
  // ViewContainerRef,
  // ElementRef,
  SimpleChanges,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Builder } from '@builder.io/sdk';

interface BuilderBlocksProps {
  blocks?: any[];
  child?: boolean;
  parentElementId?: string;
  dataPath?: string;
}

@Component({
  selector: 'builder-blocks-outlet',
  templateUrl: './builder-blocks-outlet.component.html',
  styleUrls: ['./builder-blocks-outlet.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuilderBlocksOutletComponent implements AfterViewInit, OnChanges {
  @Input()
  builderBlock: any;

  @Input()
  builderState: any;

  @Input()
  blocks: any;

  @Input()
  renderOnChange = true;

  @Input()
  dataPath: string | undefined;

  lastInnerHtml = '';
  lastInnerHtmlSanitized?: SafeHtml;

  get options(): BuilderBlocksProps {
    return {
      child: true,
      parentElementId: this.builderBlock.id,
      blocks: this.blocks,
      dataPath: this.dataPath,
    };
  }

  get key() {
    return this.builderBlock.id + this.dataPath;
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
    return `<builder-blocks-slot key="${this.key}"></builder-blocks-slot>`;
  }

  constructor(private domSanitizer: DomSanitizer) {}

  ngAfterViewInit() {
    if (Builder.isBrowser) {
      this.triggerstateChange();
    }
  }

  async triggerstateChange() {
    const query = `builder-blocks-slot[key="${this.key}"]`;
    const element: any = document.querySelector(query);
    if (element) {
      await customElements.whenDefined('builder-blocks-slot');
      element.setProps(this.options, this.builderState);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.blocks && this.renderOnChange) {
      this.triggerstateChange();
    }
  }
}
