import { CommonModule } from '@angular/common';
// fails because type imports cannot be injected
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import {
  Component,
  ElementRef,
  Input,
  Renderer2,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { isEmptyElement } from './dynamic-renderer.helpers';

export interface DynamicRendererProps {
  children?: any;
  TagName: any;
  attributes: any;
  actionAttributes: any;
}

@Component({
  selector: 'dynamic-renderer, DynamicRenderer',
  template: `
    <ng-template #tagnameTemplate><ng-content></ng-content></ng-template>
    <ng-container *ngIf="!isEmptyElement(TagName)">
      <ng-container *ngIf="useTypeOf(TagName) === 'string'">
        <ng-container
          *ngComponentOutlet="
            TagName;
            inputs: {
              attributes: attributes,
              actionAttributes: actionAttributes
            };
            content: myContent
          "
        ></ng-container>
      </ng-container>
      <ng-container *ngIf="!(useTypeOf(TagName) === 'string')">
        <ng-container
          *ngComponentOutlet="
            TagName;
            inputs: {
              attributes: attributes,
              actionAttributes: actionAttributes
            };
            content: myContent
          "
        ></ng-container>
      </ng-container>
    </ng-container>
    <ng-container *ngIf="!!isEmptyElement(TagName)">
      <ng-container
        *ngComponentOutlet="
          TagName;
          inputs: {
            attributes: attributes,
            actionAttributes: actionAttributes
          };
          content: myContent
        "
      ></ng-container>
    </ng-container>
  `,
  standalone: true,
  imports: [CommonModule],
  styles: [':host { display: contents; }'],
})
export default class DynamicRenderer {
  isEmptyElement = isEmptyElement;

  @Input() TagName!: DynamicRendererProps['TagName'];
  @Input() attributes!: DynamicRendererProps['attributes'];
  @Input() actionAttributes!: DynamicRendererProps['actionAttributes'];

  @ViewChild('tagnameTemplate', { static: true })
  tagnameTemplateRef!: TemplateRef<any>;

  myContent?: any[][];

  useTypeOf(obj: any): string {
    return typeof obj;
  }

  constructor(private vcRef: ViewContainerRef) {}

  ngOnInit() {
    if (typeof this.TagName === 'string') {
      switch (this.TagName) {
        case 'img':
          this.TagName = DynamicImage;
          break;
        case 'button':
          this.TagName = DynamicButton;
          break;
        case 'a':
          this.TagName = DynamicLink;
          break;
        default:
          break;
      }
      this.myContent = [
        this.vcRef.createEmbeddedView(this.tagnameTemplateRef).rootNodes,
      ];
    } else {
      this.myContent = [
        this.vcRef.createEmbeddedView(this.tagnameTemplateRef).rootNodes,
      ];
    }
  }
}

@Component({
  selector: 'dynamic-image, DynamicImage',
  template: ` <img #v /> `,
  standalone: true,
  styles: [':host { display: contents; }'],
})
export class DynamicImage {
  @Input() attributes!: any;

  @ViewChild('v', { read: ElementRef })
  v!: ElementRef;

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit() {
    const el = this.v && this.v.nativeElement;
    if (el && this.attributes) {
      Object.keys(this.attributes).forEach((key) => {
        this.renderer.setAttribute(el, key, this.attributes[key] ?? '');
      });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.attributes) return;

    const el = this.v && this.v.nativeElement;
    if (el && this.attributes) {
      Object.keys(this.attributes).forEach((key) => {
        this.renderer.setAttribute(el, key, this.attributes[key] ?? '');
      });
    }
  }
}

@Component({
  selector: 'dynamic-button, DynamicButton',
  template: ` <button #v><ng-content></ng-content></button>`,
  standalone: true,
  styles: [':host { display: contents; }'],
})
export class DynamicButton {
  @Input() attributes!: any;
  @Input() actionAttributes!: any;

  @ViewChild('v', { read: ElementRef })
  v!: ElementRef;

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit() {
    const el = this.v && this.v.nativeElement;
    if (el && this.attributes) {
      Object.keys(this.attributes).forEach((key) => {
        if (key.startsWith('on')) {
          this.renderer.listen(
            el,
            key.replace('on', '').toLowerCase(),
            this.attributes[key]
          );
        } else {
          this.renderer.setAttribute(el, key, this.attributes[key] ?? '');
        }
      });
    }
  }

  ngOnChanges() {
    const el = this.v && this.v.nativeElement;
    if (el && this.attributes) {
      Object.keys(this.attributes).forEach((key) => {
        if (key.startsWith('on')) {
          this.renderer.listen(
            el,
            key.replace('on', '').toLowerCase(),
            this.attributes[key]
          );
        } else {
          this.renderer.setAttribute(el, key, this.attributes[key] ?? '');
        }
      });
    }
  }
}

@Component({
  selector: 'dynamic-link, DynamicLink',
  template: ` <a #v><ng-content></ng-content></a>`,
  standalone: true,
  styles: [':host { display: contents; }'],
})
export class DynamicLink {
  @Input() attributes!: any;
  @Input() actionAttributes!: any;

  @ViewChild('v', { read: ElementRef })
  v!: ElementRef;

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit() {
    const el = this.v && this.v.nativeElement;
    if (el && this.attributes) {
      Object.keys(this.attributes).forEach((key) => {
        if (key.startsWith('on')) {
          this.renderer.listen(
            el,
            key.replace('on', '').toLowerCase(),
            this.attributes[key]
          );
        } else {
          this.renderer.setAttribute(el, key, this.attributes[key] ?? '');
        }
      });
    }
  }

  ngOnChanges() {
    const el = this.v && this.v.nativeElement;
    if (el && this.attributes) {
      Object.keys(this.attributes).forEach((key) => {
        if (key.startsWith('on')) {
          this.renderer.listen(
            el,
            key.replace('on', '').toLowerCase(),
            this.attributes[key]
          );
        } else {
          this.renderer.setAttribute(el, key, this.attributes[key] ?? '');
        }
      });
    }
  }
}
