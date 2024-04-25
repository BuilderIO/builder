// fails because type imports cannot be injected
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import {
  Component,
  ViewChild,
  ElementRef,
  Input,
  ViewContainerRef,
  TemplateRef,
  Renderer2,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DynamicRendererProps {
  children?: any;
  TagName: any;
  attributes: any;
  actionAttributes: any;
}

import { isEmptyElement } from './dynamic-renderer.helpers';

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
})
export class DynamicImage {
  @Input() attributes!: any;

  @ViewChild('v', { read: ElementRef })
  v!: ElementRef;

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit() {
    const el = this.v.nativeElement;
    if (this.attributes) {
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
})
export class DynamicButton {
  @Input() attributes!: any;

  @ViewChild('v', { read: ElementRef })
  v!: ElementRef;

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit() {
    const el = this.v.nativeElement;
    if (this.attributes) {
      Object.keys(this.attributes).forEach((key) => {
        this.renderer.setAttribute(el, key, this.attributes[key] ?? '');
      });
    }
  }
}

@Component({
  selector: 'dynamic-link, DynamicLink',
  template: ` <a #v><ng-content></ng-content></a>`,
  standalone: true,
})
export class DynamicLink {
  @Input() attributes!: any;

  @ViewChild('v', { read: ElementRef })
  v!: ElementRef;

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit() {
    const el = this.v.nativeElement;
    if (this.attributes) {
      Object.keys(this.attributes).forEach((key) => {
        this.renderer.setAttribute(el, key, this.attributes[key] ?? '');
      });
    }
  }
}
