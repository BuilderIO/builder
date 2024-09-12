import { CommonModule } from '@angular/common';
// fails because type imports cannot be injected
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import {
  Component,
  ElementRef,
  Input,
  Renderer2,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'dynamic-div, DynamicDiv',
  template: `
    <div
      #v
      (click)="onClick && onClick($event)"
      (mouseenter)="onMouseEnter && onMouseEnter($event)"
    >
      <ng-content></ng-content>
    </div>
  `,
  standalone: true,
  imports: [CommonModule],
  styles: [
    ':host { display: contents; }',
    '.props-blocks-wrapper { display: flex; flex-direction: column; align-items: stretch; }',
  ],
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
  @Input() onClick: any;
  @Input() onMouseEnter: any;
  @Input() onKeyPress: any;
  @Input() hidden: any;
  @Input('aria-hidden') ariaHidden: any;

  @ViewChild('v', { read: ElementRef })
  v!: ElementRef;

  private _listenerFns = new Map<string, () => void>();

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit() {
    const el = this.v?.nativeElement;
    if (!el) {
      return;
    }
    this.setAttributes(el, this.attributes);
    this.setAttributes(el, this.actionAttributes);
    this.setAttributes(el, this.showContentProps);
    this.setAttribute(el, 'class', this.classProp);
    this.setAttribute(el, 'style', this.style);
    this.setAttribute(el, 'builder-parent-id', this.builderParentId);
    this.setAttribute(el, 'builder-path', this.builderPath);
    this.setAttribute(el, 'builder-model', this.builderModel);
    this.setAttribute(el, 'builder-content-id', this.builderContentId);
    this.setAttribute(el, 'hidden', this.hidden);
    this.setAttribute(el, 'aria-hidden', this.ariaHidden);
  }

  ngOnChanges(changes) {
    const el = this.v?.nativeElement;
    if (!el) {
      return;
    }

    if (Object.keys(changes).length === 0) {
      return;
    }

    if (changes.attributes) {
      this.setAttributes(el, this.attributes, changes.attributes.currentValue);
    }
    if (changes.actionAttributes) {
      this.setAttributes(
        el,
        this.actionAttributes,
        changes.actionAttributes.currentValue
      );
    }
    if (changes.showContentProps) {
      this.setAttributes(
        el,
        this.showContentProps,
        changes.showContentProps.currentValue
      );
    }
    if (changes.classProp) this.setAttribute(el, 'class', this.classProp);
    if (changes.style) this.setAttribute(el, 'style', this.style);
    if (changes.builderParentId)
      this.setAttribute(el, 'builder-parent-id', this.builderParentId);
    if (changes.builderPath)
      this.setAttribute(el, 'builder-path', this.builderPath);
    if (changes.builderModel)
      this.setAttribute(el, 'builder-model', this.builderModel);
    if (changes.builderContentId)
      this.setAttribute(el, 'builder-content-id', this.builderContentId);
    if (changes.hidden) this.setAttribute(el, 'hidden', this.hidden);
    if (changes.ariaHidden)
      this.setAttribute(el, 'aria-hidden', this.ariaHidden);
  }

  private setAttributes(el: any, value: any, changes?: any) {
    if (!el) return;

    const target = changes ? changes : value;

    if (!target) return;

    Object.keys(target).forEach((key) => {
      if (key.startsWith('on')) {
        if (this._listenerFns.has(key)) {
          this._listenerFns.get(key)!();
        }
        this._listenerFns.set(
          key,
          this.renderer.listen(
            el,
            key.replace('on', '').toLowerCase(),
            target[key]
          )
        );
      } else {
        this.renderer.setAttribute(el, key, target[key] ?? '');
      }
    });
  }

  private setAttribute(el: HTMLElement, key: string, value: any) {
    if (value) {
      this.renderer.setAttribute(el, key, value);
    }
  }

  ngOnDestroy() {
    this._listenerFns.forEach((fn) => fn());
  }
}
