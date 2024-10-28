import fs from 'fs';

const PATH_TO_DYNAMIC_RENDERER =
  './src/components/dynamic-renderer/dynamic-renderer.ts';

if (!fs.existsSync(PATH_TO_DYNAMIC_RENDERER)) {
  console.error(
    `File ${PATH_TO_DYNAMIC_RENDERER} not found! Was the file moved or renamed?`
  );
  process.exit(1);
}

console.log('Generating dynamic-renderer.ts component...');

const htmlElements = [
  'a',
  'button',
  'div',
  'span',
  'p',
  'img',
  'input',
  'textarea',
  'select',
  'option',
  'form',
  'label',
  'ul',
  'li',
  'table',
  'tr',
  'td',
  'th',
  'thead',
  'tbody',
  'footer',
  'header',
  'nav',
  'section',
  'article',
  'aside',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'blockquote',
  'code',
  'pre',
  'figure',
  'figcaption',
  'video',
  'audio',
  'canvas',
  'iframe',
];

const voidElements = ['img', 'input'];

const dynamicRendererImports = [
  `import { CommonModule } from '@angular/common';`,
  `import { Component, ElementRef, Input, Renderer2, SimpleChanges, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';`,
  `import { isEmptyElement } from './dynamic-renderer.helpers';`,
];

const dynamicComponentTemplate = (tagName) => {
  const isVoidElement = voidElements.includes(tagName);
  return `
@Component({
  selector: 'dynamic-${tagName}, Dynamic${capitalize(tagName)}',
  template: \` <${tagName} #v ${isVoidElement ? '' : '><ng-content></ng-content>'}${isVoidElement ? '/>' : `</${tagName}>`} \`,
  standalone: true,
  styles: [':host { display: contents; }'],
})
export class Dynamic${capitalize(tagName)} {
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
        this._listenerFns.set(key, this.renderer.listen(el, key.replace('on', '').toLowerCase(), target[key]));
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
      this.setAttributes(this.v?.nativeElement, this.attributes, changes.attributes.currentValue);
    }
  }

  ngOnDestroy() {
    this._listenerFns.forEach(fn => fn());
  }
}`;
};

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const generateComponents = () => {
  let dynamicRendererCode = dynamicRendererImports.join('\n') + '\n\n';

  dynamicRendererCode += `
@Component({
  selector: 'dynamic-renderer, DynamicRenderer',
  template: \`
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
  \`,
  standalone: true,
  imports: [CommonModule],
  styles: [':host { display: contents; }'],
})
export default class DynamicRenderer {
  isEmptyElement = isEmptyElement;

  @Input() TagName!: any;
  @Input() attributes!: any;
  @Input() actionAttributes!: any;

  @ViewChild('tagnameTemplate', { static: true }) tagnameTemplateRef!: TemplateRef<any>;

  myContent?: any[][];

  useTypeOf(obj: any): string {
    return typeof obj;
  }

  constructor(private vcRef: ViewContainerRef) {}

  ngOnInit() {
    if (typeof this.TagName === 'string') {
      switch (this.TagName) {
        ${htmlElements.map((el) => `case '${el}': this.TagName = Dynamic${capitalize(el)}; break;`).join('\n        ')}
        default:
          break;
      }
    }
    this.myContent = [this.vcRef.createEmbeddedView(this.tagnameTemplateRef).rootNodes];
  }
}
`;

  htmlElements.forEach((tagName) => {
    dynamicRendererCode += dynamicComponentTemplate(tagName) + '\n';
  });

  fs.writeFileSync(PATH_TO_DYNAMIC_RENDERER, dynamicRendererCode);

  console.log('Dynamic renderer generated successfully!');
};

generateComponents();
