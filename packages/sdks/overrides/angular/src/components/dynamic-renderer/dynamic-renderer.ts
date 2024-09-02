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

  @Input() TagName!: any;
  @Input() attributes!: any;
  @Input() actionAttributes!: any;

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
        case 'a':
          this.TagName = DynamicA;
          break;
        case 'button':
          this.TagName = DynamicButton;
          break;
        case 'div':
          this.TagName = DynamicDiv;
          break;
        case 'span':
          this.TagName = DynamicSpan;
          break;
        case 'p':
          this.TagName = DynamicP;
          break;
        case 'img':
          this.TagName = DynamicImg;
          break;
        case 'input':
          this.TagName = DynamicInput;
          break;
        case 'textarea':
          this.TagName = DynamicTextarea;
          break;
        case 'select':
          this.TagName = DynamicSelect;
          break;
        case 'option':
          this.TagName = DynamicOption;
          break;
        case 'form':
          this.TagName = DynamicForm;
          break;
        case 'label':
          this.TagName = DynamicLabel;
          break;
        case 'ul':
          this.TagName = DynamicUl;
          break;
        case 'li':
          this.TagName = DynamicLi;
          break;
        case 'table':
          this.TagName = DynamicTable;
          break;
        case 'tr':
          this.TagName = DynamicTr;
          break;
        case 'td':
          this.TagName = DynamicTd;
          break;
        case 'th':
          this.TagName = DynamicTh;
          break;
        case 'thead':
          this.TagName = DynamicThead;
          break;
        case 'tbody':
          this.TagName = DynamicTbody;
          break;
        case 'footer':
          this.TagName = DynamicFooter;
          break;
        case 'header':
          this.TagName = DynamicHeader;
          break;
        case 'nav':
          this.TagName = DynamicNav;
          break;
        case 'section':
          this.TagName = DynamicSection;
          break;
        case 'article':
          this.TagName = DynamicArticle;
          break;
        case 'aside':
          this.TagName = DynamicAside;
          break;
        case 'h1':
          this.TagName = DynamicH1;
          break;
        case 'h2':
          this.TagName = DynamicH2;
          break;
        case 'h3':
          this.TagName = DynamicH3;
          break;
        case 'h4':
          this.TagName = DynamicH4;
          break;
        case 'h5':
          this.TagName = DynamicH5;
          break;
        case 'h6':
          this.TagName = DynamicH6;
          break;
        case 'blockquote':
          this.TagName = DynamicBlockquote;
          break;
        case 'code':
          this.TagName = DynamicCode;
          break;
        case 'pre':
          this.TagName = DynamicPre;
          break;
        case 'figure':
          this.TagName = DynamicFigure;
          break;
        case 'figcaption':
          this.TagName = DynamicFigcaption;
          break;
        case 'video':
          this.TagName = DynamicVideo;
          break;
        case 'audio':
          this.TagName = DynamicAudio;
          break;
        case 'canvas':
          this.TagName = DynamicCanvas;
          break;
        case 'iframe':
          this.TagName = DynamicIframe;
          break;
        default:
          break;
      }
    }
    this.myContent = [
      this.vcRef.createEmbeddedView(this.tagnameTemplateRef).rootNodes,
    ];
  }
}

@Component({
  selector: 'dynamic-a, DynamicA',
  template: ` <a #v><ng-content></ng-content></a> `,
  standalone: true,
  styles: [':host { display: contents; }'],
})
export class DynamicA {
  @Input() attributes!: any;
  @Input() actionAttributes?: any;

  @ViewChild('v', { read: ElementRef }) v!: ElementRef;

  _listenerFns = new Map<string, () => void>();

  constructor(private renderer: Renderer2) {}

  setAttributes(el: any, value: any, changes?: any) {
    if (!el) return;

    const target = changes ? changes : value;
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

  ngAfterViewInit() {
    this.setAttributes(this.v?.nativeElement, this.attributes);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.attributes) {
      this.setAttributes(
        this.v?.nativeElement,
        this.attributes,
        changes.attributes.currentValue
      );
    }
  }

  ngOnDestroy() {
    this._listenerFns.forEach((fn) => fn());
  }
}

@Component({
  selector: 'dynamic-button, DynamicButton',
  template: ` <button #v><ng-content></ng-content></button> `,
  standalone: true,
  styles: [':host { display: contents; }'],
})
export class DynamicButton {
  @Input() attributes!: any;
  @Input() actionAttributes?: any;

  @ViewChild('v', { read: ElementRef }) v!: ElementRef;

  _listenerFns = new Map<string, () => void>();

  constructor(private renderer: Renderer2) {}

  setAttributes(el: any, value: any, changes?: any) {
    if (!el) return;

    const target = changes ? changes : value;
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

  ngAfterViewInit() {
    this.setAttributes(this.v?.nativeElement, this.attributes);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.attributes) {
      this.setAttributes(
        this.v?.nativeElement,
        this.attributes,
        changes.attributes.currentValue
      );
    }
  }

  ngOnDestroy() {
    this._listenerFns.forEach((fn) => fn());
  }
}

@Component({
  selector: 'dynamic-div, DynamicDiv',
  template: ` <div #v><ng-content></ng-content></div> `,
  standalone: true,
  styles: [':host { display: contents; }'],
})
export class DynamicDiv {
  @Input() attributes!: any;
  @Input() actionAttributes?: any;

  @ViewChild('v', { read: ElementRef }) v!: ElementRef;

  _listenerFns = new Map<string, () => void>();

  constructor(private renderer: Renderer2) {}

  setAttributes(el: any, value: any, changes?: any) {
    if (!el) return;

    const target = changes ? changes : value;
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

  ngAfterViewInit() {
    this.setAttributes(this.v?.nativeElement, this.attributes);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.attributes) {
      this.setAttributes(
        this.v?.nativeElement,
        this.attributes,
        changes.attributes.currentValue
      );
    }
  }

  ngOnDestroy() {
    this._listenerFns.forEach((fn) => fn());
  }
}

@Component({
  selector: 'dynamic-span, DynamicSpan',
  template: ` <span #v><ng-content></ng-content></span> `,
  standalone: true,
  styles: [':host { display: contents; }'],
})
export class DynamicSpan {
  @Input() attributes!: any;
  @Input() actionAttributes?: any;

  @ViewChild('v', { read: ElementRef }) v!: ElementRef;

  _listenerFns = new Map<string, () => void>();

  constructor(private renderer: Renderer2) {}

  setAttributes(el: any, value: any, changes?: any) {
    if (!el) return;

    const target = changes ? changes : value;
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

  ngAfterViewInit() {
    this.setAttributes(this.v?.nativeElement, this.attributes);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.attributes) {
      this.setAttributes(
        this.v?.nativeElement,
        this.attributes,
        changes.attributes.currentValue
      );
    }
  }

  ngOnDestroy() {
    this._listenerFns.forEach((fn) => fn());
  }
}

@Component({
  selector: 'dynamic-p, DynamicP',
  template: ` <p #v><ng-content></ng-content></p> `,
  standalone: true,
  styles: [':host { display: contents; }'],
})
export class DynamicP {
  @Input() attributes!: any;
  @Input() actionAttributes?: any;

  @ViewChild('v', { read: ElementRef }) v!: ElementRef;

  _listenerFns = new Map<string, () => void>();

  constructor(private renderer: Renderer2) {}

  setAttributes(el: any, value: any, changes?: any) {
    if (!el) return;

    const target = changes ? changes : value;
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

  ngAfterViewInit() {
    this.setAttributes(this.v?.nativeElement, this.attributes);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.attributes) {
      this.setAttributes(
        this.v?.nativeElement,
        this.attributes,
        changes.attributes.currentValue
      );
    }
  }

  ngOnDestroy() {
    this._listenerFns.forEach((fn) => fn());
  }
}

@Component({
  selector: 'dynamic-img, DynamicImg',
  template: ` <img #v /> `,
  standalone: true,
  styles: [':host { display: contents; }'],
})
export class DynamicImg {
  @Input() attributes!: any;
  @Input() actionAttributes?: any;

  @ViewChild('v', { read: ElementRef }) v!: ElementRef;

  _listenerFns = new Map<string, () => void>();

  constructor(private renderer: Renderer2) {}

  setAttributes(el: any, value: any, changes?: any) {
    if (!el) return;

    const target = changes ? changes : value;
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

  ngAfterViewInit() {
    this.setAttributes(this.v?.nativeElement, this.attributes);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.attributes) {
      this.setAttributes(
        this.v?.nativeElement,
        this.attributes,
        changes.attributes.currentValue
      );
    }
  }

  ngOnDestroy() {
    this._listenerFns.forEach((fn) => fn());
  }
}

@Component({
  selector: 'dynamic-input, DynamicInput',
  template: ` <input #v /> `,
  standalone: true,
  styles: [':host { display: contents; }'],
})
export class DynamicInput {
  @Input() attributes!: any;
  @Input() actionAttributes?: any;

  @ViewChild('v', { read: ElementRef }) v!: ElementRef;

  _listenerFns = new Map<string, () => void>();

  constructor(private renderer: Renderer2) {}

  setAttributes(el: any, value: any, changes?: any) {
    if (!el) return;

    const target = changes ? changes : value;
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

  ngAfterViewInit() {
    this.setAttributes(this.v?.nativeElement, this.attributes);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.attributes) {
      this.setAttributes(
        this.v?.nativeElement,
        this.attributes,
        changes.attributes.currentValue
      );
    }
  }

  ngOnDestroy() {
    this._listenerFns.forEach((fn) => fn());
  }
}

@Component({
  selector: 'dynamic-textarea, DynamicTextarea',
  template: ` <textarea #v><ng-content></ng-content></textarea> `,
  standalone: true,
  styles: [':host { display: contents; }'],
})
export class DynamicTextarea {
  @Input() attributes!: any;
  @Input() actionAttributes?: any;

  @ViewChild('v', { read: ElementRef }) v!: ElementRef;

  _listenerFns = new Map<string, () => void>();

  constructor(private renderer: Renderer2) {}

  setAttributes(el: any, value: any, changes?: any) {
    if (!el) return;

    const target = changes ? changes : value;
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

  ngAfterViewInit() {
    this.setAttributes(this.v?.nativeElement, this.attributes);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.attributes) {
      this.setAttributes(
        this.v?.nativeElement,
        this.attributes,
        changes.attributes.currentValue
      );
    }
  }

  ngOnDestroy() {
    this._listenerFns.forEach((fn) => fn());
  }
}

@Component({
  selector: 'dynamic-select, DynamicSelect',
  template: `
    <select #v>
      <ng-content></ng-content>
    </select>
  `,
  standalone: true,
  styles: [':host { display: contents; }'],
})
export class DynamicSelect {
  @Input() attributes!: any;
  @Input() actionAttributes?: any;

  @ViewChild('v', { read: ElementRef }) v!: ElementRef;

  _listenerFns = new Map<string, () => void>();

  constructor(private renderer: Renderer2) {}

  setAttributes(el: any, value: any, changes?: any) {
    if (!el) return;

    const target = changes ? changes : value;
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

  ngAfterViewInit() {
    this.setAttributes(this.v?.nativeElement, this.attributes);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.attributes) {
      this.setAttributes(
        this.v?.nativeElement,
        this.attributes,
        changes.attributes.currentValue
      );
    }
  }

  ngOnDestroy() {
    this._listenerFns.forEach((fn) => fn());
  }
}

@Component({
  selector: 'dynamic-option, DynamicOption',
  template: ` <option #v><ng-content></ng-content></option> `,
  standalone: true,
  styles: [':host { display: contents; }'],
})
export class DynamicOption {
  @Input() attributes!: any;
  @Input() actionAttributes?: any;

  @ViewChild('v', { read: ElementRef }) v!: ElementRef;

  _listenerFns = new Map<string, () => void>();

  constructor(private renderer: Renderer2) {}

  setAttributes(el: any, value: any, changes?: any) {
    if (!el) return;

    const target = changes ? changes : value;
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

  ngAfterViewInit() {
    this.setAttributes(this.v?.nativeElement, this.attributes);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.attributes) {
      this.setAttributes(
        this.v?.nativeElement,
        this.attributes,
        changes.attributes.currentValue
      );
    }
  }

  ngOnDestroy() {
    this._listenerFns.forEach((fn) => fn());
  }
}

@Component({
  selector: 'dynamic-form, DynamicForm',
  template: ` <form #v><ng-content></ng-content></form> `,
  standalone: true,
  styles: [':host { display: contents; }'],
})
export class DynamicForm {
  @Input() attributes!: any;
  @Input() actionAttributes?: any;

  @ViewChild('v', { read: ElementRef }) v!: ElementRef;

  _listenerFns = new Map<string, () => void>();

  constructor(private renderer: Renderer2) {}

  setAttributes(el: any, value: any, changes?: any) {
    if (!el) return;

    const target = changes ? changes : value;
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

  ngAfterViewInit() {
    this.setAttributes(this.v?.nativeElement, this.attributes);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.attributes) {
      this.setAttributes(
        this.v?.nativeElement,
        this.attributes,
        changes.attributes.currentValue
      );
    }
  }

  ngOnDestroy() {
    this._listenerFns.forEach((fn) => fn());
  }
}

@Component({
  selector: 'dynamic-label, DynamicLabel',
  template: ` <label #v><ng-content></ng-content></label> `,
  standalone: true,
  styles: [':host { display: contents; }'],
})
export class DynamicLabel {
  @Input() attributes!: any;
  @Input() actionAttributes?: any;

  @ViewChild('v', { read: ElementRef }) v!: ElementRef;

  _listenerFns = new Map<string, () => void>();

  constructor(private renderer: Renderer2) {}

  setAttributes(el: any, value: any, changes?: any) {
    if (!el) return;

    const target = changes ? changes : value;
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

  ngAfterViewInit() {
    this.setAttributes(this.v?.nativeElement, this.attributes);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.attributes) {
      this.setAttributes(
        this.v?.nativeElement,
        this.attributes,
        changes.attributes.currentValue
      );
    }
  }

  ngOnDestroy() {
    this._listenerFns.forEach((fn) => fn());
  }
}

@Component({
  selector: 'dynamic-ul, DynamicUl',
  template: `
    <ul #v>
      <ng-content></ng-content>
    </ul>
  `,
  standalone: true,
  styles: [':host { display: contents; }'],
})
export class DynamicUl {
  @Input() attributes!: any;
  @Input() actionAttributes?: any;

  @ViewChild('v', { read: ElementRef }) v!: ElementRef;

  _listenerFns = new Map<string, () => void>();

  constructor(private renderer: Renderer2) {}

  setAttributes(el: any, value: any, changes?: any) {
    if (!el) return;

    const target = changes ? changes : value;
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

  ngAfterViewInit() {
    this.setAttributes(this.v?.nativeElement, this.attributes);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.attributes) {
      this.setAttributes(
        this.v?.nativeElement,
        this.attributes,
        changes.attributes.currentValue
      );
    }
  }

  ngOnDestroy() {
    this._listenerFns.forEach((fn) => fn());
  }
}

@Component({
  selector: 'dynamic-li, DynamicLi',
  template: ` <li #v><ng-content></ng-content></li> `,
  standalone: true,
  styles: [':host { display: contents; }'],
})
export class DynamicLi {
  @Input() attributes!: any;
  @Input() actionAttributes?: any;

  @ViewChild('v', { read: ElementRef }) v!: ElementRef;

  _listenerFns = new Map<string, () => void>();

  constructor(private renderer: Renderer2) {}

  setAttributes(el: any, value: any, changes?: any) {
    if (!el) return;

    const target = changes ? changes : value;
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

  ngAfterViewInit() {
    this.setAttributes(this.v?.nativeElement, this.attributes);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.attributes) {
      this.setAttributes(
        this.v?.nativeElement,
        this.attributes,
        changes.attributes.currentValue
      );
    }
  }

  ngOnDestroy() {
    this._listenerFns.forEach((fn) => fn());
  }
}

@Component({
  selector: 'dynamic-table, DynamicTable',
  template: `
    <table #v>
      <ng-content></ng-content>
    </table>
  `,
  standalone: true,
  styles: [':host { display: contents; }'],
})
export class DynamicTable {
  @Input() attributes!: any;
  @Input() actionAttributes?: any;

  @ViewChild('v', { read: ElementRef }) v!: ElementRef;

  _listenerFns = new Map<string, () => void>();

  constructor(private renderer: Renderer2) {}

  setAttributes(el: any, value: any, changes?: any) {
    if (!el) return;

    const target = changes ? changes : value;
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

  ngAfterViewInit() {
    this.setAttributes(this.v?.nativeElement, this.attributes);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.attributes) {
      this.setAttributes(
        this.v?.nativeElement,
        this.attributes,
        changes.attributes.currentValue
      );
    }
  }

  ngOnDestroy() {
    this._listenerFns.forEach((fn) => fn());
  }
}

@Component({
  selector: 'dynamic-tr, DynamicTr',
  template: `
    <tr #v>
      <ng-content></ng-content>
    </tr>
  `,
  standalone: true,
  styles: [':host { display: contents; }'],
})
export class DynamicTr {
  @Input() attributes!: any;
  @Input() actionAttributes?: any;

  @ViewChild('v', { read: ElementRef }) v!: ElementRef;

  _listenerFns = new Map<string, () => void>();

  constructor(private renderer: Renderer2) {}

  setAttributes(el: any, value: any, changes?: any) {
    if (!el) return;

    const target = changes ? changes : value;
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

  ngAfterViewInit() {
    this.setAttributes(this.v?.nativeElement, this.attributes);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.attributes) {
      this.setAttributes(
        this.v?.nativeElement,
        this.attributes,
        changes.attributes.currentValue
      );
    }
  }

  ngOnDestroy() {
    this._listenerFns.forEach((fn) => fn());
  }
}

@Component({
  selector: 'dynamic-td, DynamicTd',
  template: ` <td #v><ng-content></ng-content></td> `,
  standalone: true,
  styles: [':host { display: contents; }'],
})
export class DynamicTd {
  @Input() attributes!: any;
  @Input() actionAttributes?: any;

  @ViewChild('v', { read: ElementRef }) v!: ElementRef;

  _listenerFns = new Map<string, () => void>();

  constructor(private renderer: Renderer2) {}

  setAttributes(el: any, value: any, changes?: any) {
    if (!el) return;

    const target = changes ? changes : value;
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

  ngAfterViewInit() {
    this.setAttributes(this.v?.nativeElement, this.attributes);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.attributes) {
      this.setAttributes(
        this.v?.nativeElement,
        this.attributes,
        changes.attributes.currentValue
      );
    }
  }

  ngOnDestroy() {
    this._listenerFns.forEach((fn) => fn());
  }
}

@Component({
  selector: 'dynamic-th, DynamicTh',
  template: ` <th #v><ng-content></ng-content></th> `,
  standalone: true,
  styles: [':host { display: contents; }'],
})
export class DynamicTh {
  @Input() attributes!: any;
  @Input() actionAttributes?: any;

  @ViewChild('v', { read: ElementRef }) v!: ElementRef;

  _listenerFns = new Map<string, () => void>();

  constructor(private renderer: Renderer2) {}

  setAttributes(el: any, value: any, changes?: any) {
    if (!el) return;

    const target = changes ? changes : value;
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

  ngAfterViewInit() {
    this.setAttributes(this.v?.nativeElement, this.attributes);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.attributes) {
      this.setAttributes(
        this.v?.nativeElement,
        this.attributes,
        changes.attributes.currentValue
      );
    }
  }

  ngOnDestroy() {
    this._listenerFns.forEach((fn) => fn());
  }
}

@Component({
  selector: 'dynamic-thead, DynamicThead',
  template: `
    <thead #v>
      <ng-content></ng-content>
    </thead>
  `,
  standalone: true,
  styles: [':host { display: contents; }'],
})
export class DynamicThead {
  @Input() attributes!: any;
  @Input() actionAttributes?: any;

  @ViewChild('v', { read: ElementRef }) v!: ElementRef;

  _listenerFns = new Map<string, () => void>();

  constructor(private renderer: Renderer2) {}

  setAttributes(el: any, value: any, changes?: any) {
    if (!el) return;

    const target = changes ? changes : value;
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

  ngAfterViewInit() {
    this.setAttributes(this.v?.nativeElement, this.attributes);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.attributes) {
      this.setAttributes(
        this.v?.nativeElement,
        this.attributes,
        changes.attributes.currentValue
      );
    }
  }

  ngOnDestroy() {
    this._listenerFns.forEach((fn) => fn());
  }
}

@Component({
  selector: 'dynamic-tbody, DynamicTbody',
  template: `
    <tbody #v>
      <ng-content></ng-content>
    </tbody>
  `,
  standalone: true,
  styles: [':host { display: contents; }'],
})
export class DynamicTbody {
  @Input() attributes!: any;
  @Input() actionAttributes?: any;

  @ViewChild('v', { read: ElementRef }) v!: ElementRef;

  _listenerFns = new Map<string, () => void>();

  constructor(private renderer: Renderer2) {}

  setAttributes(el: any, value: any, changes?: any) {
    if (!el) return;

    const target = changes ? changes : value;
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

  ngAfterViewInit() {
    this.setAttributes(this.v?.nativeElement, this.attributes);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.attributes) {
      this.setAttributes(
        this.v?.nativeElement,
        this.attributes,
        changes.attributes.currentValue
      );
    }
  }

  ngOnDestroy() {
    this._listenerFns.forEach((fn) => fn());
  }
}

@Component({
  selector: 'dynamic-footer, DynamicFooter',
  template: ` <footer #v><ng-content></ng-content></footer> `,
  standalone: true,
  styles: [':host { display: contents; }'],
})
export class DynamicFooter {
  @Input() attributes!: any;
  @Input() actionAttributes?: any;

  @ViewChild('v', { read: ElementRef }) v!: ElementRef;

  _listenerFns = new Map<string, () => void>();

  constructor(private renderer: Renderer2) {}

  setAttributes(el: any, value: any, changes?: any) {
    if (!el) return;

    const target = changes ? changes : value;
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

  ngAfterViewInit() {
    this.setAttributes(this.v?.nativeElement, this.attributes);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.attributes) {
      this.setAttributes(
        this.v?.nativeElement,
        this.attributes,
        changes.attributes.currentValue
      );
    }
  }

  ngOnDestroy() {
    this._listenerFns.forEach((fn) => fn());
  }
}

@Component({
  selector: 'dynamic-header, DynamicHeader',
  template: ` <header #v><ng-content></ng-content></header> `,
  standalone: true,
  styles: [':host { display: contents; }'],
})
export class DynamicHeader {
  @Input() attributes!: any;
  @Input() actionAttributes?: any;

  @ViewChild('v', { read: ElementRef }) v!: ElementRef;

  _listenerFns = new Map<string, () => void>();

  constructor(private renderer: Renderer2) {}

  setAttributes(el: any, value: any, changes?: any) {
    if (!el) return;

    const target = changes ? changes : value;
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

  ngAfterViewInit() {
    this.setAttributes(this.v?.nativeElement, this.attributes);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.attributes) {
      this.setAttributes(
        this.v?.nativeElement,
        this.attributes,
        changes.attributes.currentValue
      );
    }
  }

  ngOnDestroy() {
    this._listenerFns.forEach((fn) => fn());
  }
}

@Component({
  selector: 'dynamic-nav, DynamicNav',
  template: ` <nav #v><ng-content></ng-content></nav> `,
  standalone: true,
  styles: [':host { display: contents; }'],
})
export class DynamicNav {
  @Input() attributes!: any;
  @Input() actionAttributes?: any;

  @ViewChild('v', { read: ElementRef }) v!: ElementRef;

  _listenerFns = new Map<string, () => void>();

  constructor(private renderer: Renderer2) {}

  setAttributes(el: any, value: any, changes?: any) {
    if (!el) return;

    const target = changes ? changes : value;
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

  ngAfterViewInit() {
    this.setAttributes(this.v?.nativeElement, this.attributes);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.attributes) {
      this.setAttributes(
        this.v?.nativeElement,
        this.attributes,
        changes.attributes.currentValue
      );
    }
  }

  ngOnDestroy() {
    this._listenerFns.forEach((fn) => fn());
  }
}

@Component({
  selector: 'dynamic-section, DynamicSection',
  template: ` <section #v><ng-content></ng-content></section> `,
  standalone: true,
  styles: [':host { display: contents; }'],
})
export class DynamicSection {
  @Input() attributes!: any;
  @Input() actionAttributes?: any;

  @ViewChild('v', { read: ElementRef }) v!: ElementRef;

  _listenerFns = new Map<string, () => void>();

  constructor(private renderer: Renderer2) {}

  setAttributes(el: any, value: any, changes?: any) {
    if (!el) return;

    const target = changes ? changes : value;
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

  ngAfterViewInit() {
    this.setAttributes(this.v?.nativeElement, this.attributes);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.attributes) {
      this.setAttributes(
        this.v?.nativeElement,
        this.attributes,
        changes.attributes.currentValue
      );
    }
  }

  ngOnDestroy() {
    this._listenerFns.forEach((fn) => fn());
  }
}

@Component({
  selector: 'dynamic-article, DynamicArticle',
  template: ` <article #v><ng-content></ng-content></article> `,
  standalone: true,
  styles: [':host { display: contents; }'],
})
export class DynamicArticle {
  @Input() attributes!: any;
  @Input() actionAttributes?: any;

  @ViewChild('v', { read: ElementRef }) v!: ElementRef;

  _listenerFns = new Map<string, () => void>();

  constructor(private renderer: Renderer2) {}

  setAttributes(el: any, value: any, changes?: any) {
    if (!el) return;

    const target = changes ? changes : value;
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

  ngAfterViewInit() {
    this.setAttributes(this.v?.nativeElement, this.attributes);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.attributes) {
      this.setAttributes(
        this.v?.nativeElement,
        this.attributes,
        changes.attributes.currentValue
      );
    }
  }

  ngOnDestroy() {
    this._listenerFns.forEach((fn) => fn());
  }
}

@Component({
  selector: 'dynamic-aside, DynamicAside',
  template: ` <aside #v><ng-content></ng-content></aside> `,
  standalone: true,
  styles: [':host { display: contents; }'],
})
export class DynamicAside {
  @Input() attributes!: any;
  @Input() actionAttributes?: any;

  @ViewChild('v', { read: ElementRef }) v!: ElementRef;

  _listenerFns = new Map<string, () => void>();

  constructor(private renderer: Renderer2) {}

  setAttributes(el: any, value: any, changes?: any) {
    if (!el) return;

    const target = changes ? changes : value;
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

  ngAfterViewInit() {
    this.setAttributes(this.v?.nativeElement, this.attributes);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.attributes) {
      this.setAttributes(
        this.v?.nativeElement,
        this.attributes,
        changes.attributes.currentValue
      );
    }
  }

  ngOnDestroy() {
    this._listenerFns.forEach((fn) => fn());
  }
}

@Component({
  selector: 'dynamic-h1, DynamicH1',
  template: ` <h1 #v><ng-content></ng-content></h1> `,
  standalone: true,
  styles: [':host { display: contents; }'],
})
export class DynamicH1 {
  @Input() attributes!: any;
  @Input() actionAttributes?: any;

  @ViewChild('v', { read: ElementRef }) v!: ElementRef;

  _listenerFns = new Map<string, () => void>();

  constructor(private renderer: Renderer2) {}

  setAttributes(el: any, value: any, changes?: any) {
    if (!el) return;

    const target = changes ? changes : value;
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

  ngAfterViewInit() {
    this.setAttributes(this.v?.nativeElement, this.attributes);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.attributes) {
      this.setAttributes(
        this.v?.nativeElement,
        this.attributes,
        changes.attributes.currentValue
      );
    }
  }

  ngOnDestroy() {
    this._listenerFns.forEach((fn) => fn());
  }
}

@Component({
  selector: 'dynamic-h2, DynamicH2',
  template: ` <h2 #v><ng-content></ng-content></h2> `,
  standalone: true,
  styles: [':host { display: contents; }'],
})
export class DynamicH2 {
  @Input() attributes!: any;
  @Input() actionAttributes?: any;

  @ViewChild('v', { read: ElementRef }) v!: ElementRef;

  _listenerFns = new Map<string, () => void>();

  constructor(private renderer: Renderer2) {}

  setAttributes(el: any, value: any, changes?: any) {
    if (!el) return;

    const target = changes ? changes : value;
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

  ngAfterViewInit() {
    this.setAttributes(this.v?.nativeElement, this.attributes);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.attributes) {
      this.setAttributes(
        this.v?.nativeElement,
        this.attributes,
        changes.attributes.currentValue
      );
    }
  }

  ngOnDestroy() {
    this._listenerFns.forEach((fn) => fn());
  }
}

@Component({
  selector: 'dynamic-h3, DynamicH3',
  template: ` <h3 #v><ng-content></ng-content></h3> `,
  standalone: true,
  styles: [':host { display: contents; }'],
})
export class DynamicH3 {
  @Input() attributes!: any;
  @Input() actionAttributes?: any;

  @ViewChild('v', { read: ElementRef }) v!: ElementRef;

  _listenerFns = new Map<string, () => void>();

  constructor(private renderer: Renderer2) {}

  setAttributes(el: any, value: any, changes?: any) {
    if (!el) return;

    const target = changes ? changes : value;
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

  ngAfterViewInit() {
    this.setAttributes(this.v?.nativeElement, this.attributes);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.attributes) {
      this.setAttributes(
        this.v?.nativeElement,
        this.attributes,
        changes.attributes.currentValue
      );
    }
  }

  ngOnDestroy() {
    this._listenerFns.forEach((fn) => fn());
  }
}

@Component({
  selector: 'dynamic-h4, DynamicH4',
  template: ` <h4 #v><ng-content></ng-content></h4> `,
  standalone: true,
  styles: [':host { display: contents; }'],
})
export class DynamicH4 {
  @Input() attributes!: any;
  @Input() actionAttributes?: any;

  @ViewChild('v', { read: ElementRef }) v!: ElementRef;

  _listenerFns = new Map<string, () => void>();

  constructor(private renderer: Renderer2) {}

  setAttributes(el: any, value: any, changes?: any) {
    if (!el) return;

    const target = changes ? changes : value;
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

  ngAfterViewInit() {
    this.setAttributes(this.v?.nativeElement, this.attributes);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.attributes) {
      this.setAttributes(
        this.v?.nativeElement,
        this.attributes,
        changes.attributes.currentValue
      );
    }
  }

  ngOnDestroy() {
    this._listenerFns.forEach((fn) => fn());
  }
}

@Component({
  selector: 'dynamic-h5, DynamicH5',
  template: ` <h5 #v><ng-content></ng-content></h5> `,
  standalone: true,
  styles: [':host { display: contents; }'],
})
export class DynamicH5 {
  @Input() attributes!: any;
  @Input() actionAttributes?: any;

  @ViewChild('v', { read: ElementRef }) v!: ElementRef;

  _listenerFns = new Map<string, () => void>();

  constructor(private renderer: Renderer2) {}

  setAttributes(el: any, value: any, changes?: any) {
    if (!el) return;

    const target = changes ? changes : value;
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

  ngAfterViewInit() {
    this.setAttributes(this.v?.nativeElement, this.attributes);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.attributes) {
      this.setAttributes(
        this.v?.nativeElement,
        this.attributes,
        changes.attributes.currentValue
      );
    }
  }

  ngOnDestroy() {
    this._listenerFns.forEach((fn) => fn());
  }
}

@Component({
  selector: 'dynamic-h6, DynamicH6',
  template: ` <h6 #v><ng-content></ng-content></h6> `,
  standalone: true,
  styles: [':host { display: contents; }'],
})
export class DynamicH6 {
  @Input() attributes!: any;
  @Input() actionAttributes?: any;

  @ViewChild('v', { read: ElementRef }) v!: ElementRef;

  _listenerFns = new Map<string, () => void>();

  constructor(private renderer: Renderer2) {}

  setAttributes(el: any, value: any, changes?: any) {
    if (!el) return;

    const target = changes ? changes : value;
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

  ngAfterViewInit() {
    this.setAttributes(this.v?.nativeElement, this.attributes);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.attributes) {
      this.setAttributes(
        this.v?.nativeElement,
        this.attributes,
        changes.attributes.currentValue
      );
    }
  }

  ngOnDestroy() {
    this._listenerFns.forEach((fn) => fn());
  }
}

@Component({
  selector: 'dynamic-blockquote, DynamicBlockquote',
  template: ` <blockquote #v><ng-content></ng-content></blockquote> `,
  standalone: true,
  styles: [':host { display: contents; }'],
})
export class DynamicBlockquote {
  @Input() attributes!: any;
  @Input() actionAttributes?: any;

  @ViewChild('v', { read: ElementRef }) v!: ElementRef;

  _listenerFns = new Map<string, () => void>();

  constructor(private renderer: Renderer2) {}

  setAttributes(el: any, value: any, changes?: any) {
    if (!el) return;

    const target = changes ? changes : value;
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

  ngAfterViewInit() {
    this.setAttributes(this.v?.nativeElement, this.attributes);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.attributes) {
      this.setAttributes(
        this.v?.nativeElement,
        this.attributes,
        changes.attributes.currentValue
      );
    }
  }

  ngOnDestroy() {
    this._listenerFns.forEach((fn) => fn());
  }
}

@Component({
  selector: 'dynamic-code, DynamicCode',
  template: ` <code #v><ng-content></ng-content></code> `,
  standalone: true,
  styles: [':host { display: contents; }'],
})
export class DynamicCode {
  @Input() attributes!: any;
  @Input() actionAttributes?: any;

  @ViewChild('v', { read: ElementRef }) v!: ElementRef;

  _listenerFns = new Map<string, () => void>();

  constructor(private renderer: Renderer2) {}

  setAttributes(el: any, value: any, changes?: any) {
    if (!el) return;

    const target = changes ? changes : value;
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

  ngAfterViewInit() {
    this.setAttributes(this.v?.nativeElement, this.attributes);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.attributes) {
      this.setAttributes(
        this.v?.nativeElement,
        this.attributes,
        changes.attributes.currentValue
      );
    }
  }

  ngOnDestroy() {
    this._listenerFns.forEach((fn) => fn());
  }
}

@Component({
  selector: 'dynamic-pre, DynamicPre',
  template: ` <pre #v><ng-content></ng-content></pre> `,
  standalone: true,
  styles: [':host { display: contents; }'],
})
export class DynamicPre {
  @Input() attributes!: any;
  @Input() actionAttributes?: any;

  @ViewChild('v', { read: ElementRef }) v!: ElementRef;

  _listenerFns = new Map<string, () => void>();

  constructor(private renderer: Renderer2) {}

  setAttributes(el: any, value: any, changes?: any) {
    if (!el) return;

    const target = changes ? changes : value;
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

  ngAfterViewInit() {
    this.setAttributes(this.v?.nativeElement, this.attributes);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.attributes) {
      this.setAttributes(
        this.v?.nativeElement,
        this.attributes,
        changes.attributes.currentValue
      );
    }
  }

  ngOnDestroy() {
    this._listenerFns.forEach((fn) => fn());
  }
}

@Component({
  selector: 'dynamic-figure, DynamicFigure',
  template: ` <figure #v><ng-content></ng-content></figure> `,
  standalone: true,
  styles: [':host { display: contents; }'],
})
export class DynamicFigure {
  @Input() attributes!: any;
  @Input() actionAttributes?: any;

  @ViewChild('v', { read: ElementRef }) v!: ElementRef;

  _listenerFns = new Map<string, () => void>();

  constructor(private renderer: Renderer2) {}

  setAttributes(el: any, value: any, changes?: any) {
    if (!el) return;

    const target = changes ? changes : value;
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

  ngAfterViewInit() {
    this.setAttributes(this.v?.nativeElement, this.attributes);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.attributes) {
      this.setAttributes(
        this.v?.nativeElement,
        this.attributes,
        changes.attributes.currentValue
      );
    }
  }

  ngOnDestroy() {
    this._listenerFns.forEach((fn) => fn());
  }
}

@Component({
  selector: 'dynamic-figcaption, DynamicFigcaption',
  template: ` <figcaption #v><ng-content></ng-content></figcaption> `,
  standalone: true,
  styles: [':host { display: contents; }'],
})
export class DynamicFigcaption {
  @Input() attributes!: any;
  @Input() actionAttributes?: any;

  @ViewChild('v', { read: ElementRef }) v!: ElementRef;

  _listenerFns = new Map<string, () => void>();

  constructor(private renderer: Renderer2) {}

  setAttributes(el: any, value: any, changes?: any) {
    if (!el) return;

    const target = changes ? changes : value;
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

  ngAfterViewInit() {
    this.setAttributes(this.v?.nativeElement, this.attributes);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.attributes) {
      this.setAttributes(
        this.v?.nativeElement,
        this.attributes,
        changes.attributes.currentValue
      );
    }
  }

  ngOnDestroy() {
    this._listenerFns.forEach((fn) => fn());
  }
}

@Component({
  selector: 'dynamic-video, DynamicVideo',
  template: ` <video #v><ng-content></ng-content></video> `,
  standalone: true,
  styles: [':host { display: contents; }'],
})
export class DynamicVideo {
  @Input() attributes!: any;
  @Input() actionAttributes?: any;

  @ViewChild('v', { read: ElementRef }) v!: ElementRef;

  _listenerFns = new Map<string, () => void>();

  constructor(private renderer: Renderer2) {}

  setAttributes(el: any, value: any, changes?: any) {
    if (!el) return;

    const target = changes ? changes : value;
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

  ngAfterViewInit() {
    this.setAttributes(this.v?.nativeElement, this.attributes);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.attributes) {
      this.setAttributes(
        this.v?.nativeElement,
        this.attributes,
        changes.attributes.currentValue
      );
    }
  }

  ngOnDestroy() {
    this._listenerFns.forEach((fn) => fn());
  }
}

@Component({
  selector: 'dynamic-audio, DynamicAudio',
  template: ` <audio #v><ng-content></ng-content></audio> `,
  standalone: true,
  styles: [':host { display: contents; }'],
})
export class DynamicAudio {
  @Input() attributes!: any;
  @Input() actionAttributes?: any;

  @ViewChild('v', { read: ElementRef }) v!: ElementRef;

  _listenerFns = new Map<string, () => void>();

  constructor(private renderer: Renderer2) {}

  setAttributes(el: any, value: any, changes?: any) {
    if (!el) return;

    const target = changes ? changes : value;
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

  ngAfterViewInit() {
    this.setAttributes(this.v?.nativeElement, this.attributes);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.attributes) {
      this.setAttributes(
        this.v?.nativeElement,
        this.attributes,
        changes.attributes.currentValue
      );
    }
  }

  ngOnDestroy() {
    this._listenerFns.forEach((fn) => fn());
  }
}

@Component({
  selector: 'dynamic-canvas, DynamicCanvas',
  template: ` <canvas #v><ng-content></ng-content></canvas> `,
  standalone: true,
  styles: [':host { display: contents; }'],
})
export class DynamicCanvas {
  @Input() attributes!: any;
  @Input() actionAttributes?: any;

  @ViewChild('v', { read: ElementRef }) v!: ElementRef;

  _listenerFns = new Map<string, () => void>();

  constructor(private renderer: Renderer2) {}

  setAttributes(el: any, value: any, changes?: any) {
    if (!el) return;

    const target = changes ? changes : value;
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

  ngAfterViewInit() {
    this.setAttributes(this.v?.nativeElement, this.attributes);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.attributes) {
      this.setAttributes(
        this.v?.nativeElement,
        this.attributes,
        changes.attributes.currentValue
      );
    }
  }

  ngOnDestroy() {
    this._listenerFns.forEach((fn) => fn());
  }
}

@Component({
  selector: 'dynamic-iframe, DynamicIframe',
  template: ` <iframe #v><ng-content></ng-content></iframe> `,
  standalone: true,
  styles: [':host { display: contents; }'],
})
export class DynamicIframe {
  @Input() attributes!: any;
  @Input() actionAttributes?: any;

  @ViewChild('v', { read: ElementRef }) v!: ElementRef;

  _listenerFns = new Map<string, () => void>();

  constructor(private renderer: Renderer2) {}

  setAttributes(el: any, value: any, changes?: any) {
    if (!el) return;

    const target = changes ? changes : value;
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

  ngAfterViewInit() {
    this.setAttributes(this.v?.nativeElement, this.attributes);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.attributes) {
      this.setAttributes(
        this.v?.nativeElement,
        this.attributes,
        changes.attributes.currentValue
      );
    }
  }

  ngOnDestroy() {
    this._listenerFns.forEach((fn) => fn());
  }
}
