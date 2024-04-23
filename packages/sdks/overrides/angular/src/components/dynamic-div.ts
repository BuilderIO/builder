// fails because type imports cannot be injected
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import {
  Component,
  ElementRef,
  Input,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'dynamic-div, DynamicDiv',
  template: ` <div #v><ng-content></ng-content></div> `,
  standalone: true,
  imports: [CommonModule],
})
export default class DynamicDiv {
  @Input() attributes: any;
  @Input() actionAttributes: any;
  @Input() BlockWrapperProps: any;
  @Input('builder-path') builderPath: any;
  @Input('builder-parent-id') builderParentId: any;
  @Input() BlocksWrapperProps: any;
  @Input() contentWrapperProps: any;
  @Input('builder-model') builderModel: any;
  @Input('builder-content-id') builderContentId: any;
  @Input() ref: any;
  @Input('class') classProp: any;
  @Input() style: any;
  @Input() showContentProps: any;

  @ViewChild('v', { read: ElementRef })
  v!: ElementRef;

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit() {
    const el = this.v.nativeElement;
    this.setAttributes(el, this.attributes);
    this.setAttributes(el, this.showContentProps);
    this.setAttribute(el, 'class', this.classProp);
    this.setAttribute(el, 'style', this.style);
    this.setAttribute(el, 'builder-parent-id', this.builderParentId);
    this.setAttribute(el, 'builder-path', this.builderPath);
    this.setAttribute(el, 'builder-model', this.builderModel);
    this.setAttribute(el, 'builder-content-id', this.builderContentId);
  }

  private setAttributes(el: HTMLElement, attributes: any) {
    if (attributes) {
      Object.keys(attributes).forEach((key) => {
        this.renderer.setAttribute(el, key, attributes[key]);
      });
    }
  }

  private setAttribute(el: HTMLElement, key: string, value: any) {
    if (value) {
      this.renderer.setAttribute(el, key, value);
    }
  }
}
