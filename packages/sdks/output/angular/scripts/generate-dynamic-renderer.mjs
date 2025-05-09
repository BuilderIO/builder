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
  `import { Component, ElementRef, input, viewChild, Renderer2, SimpleChanges, TemplateRef, ViewContainerRef, signal, computed } from '@angular/core';`,
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
  attributes = input.required<any>();
  actionAttributes = input<any | undefined>();
  tagName = input<string | undefined>();
  
  v = viewChild<ElementRef>('v');
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
    this.setAttributes(this.v()?.nativeElement, this.attributes());
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes.attributes) {
      this.setAttributes(this.v()?.nativeElement, this.attributes(), changes.attributes.currentValue);
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
    <ng-container *ngIf="!isEmptyElement(effectiveTagName())">
      <ng-container *ngIf="tagNameIsString()">
        <ng-container
          *ngComponentOutlet="
            mappedComponent();
            inputs: {
              attributes: attributes(),
              actionAttributes: actionAttributes(),
              tagName: tagName()
            };
            content: myContent
          "
        ></ng-container>
      </ng-container>
      <ng-container *ngIf="!tagNameIsString() && dynamicTagName() !== ''">
        <ng-container
          *ngComponentOutlet="
            effectiveTagName();
            inputs: {
              attributes: attributes(),
              actionAttributes: actionAttributes(),
              tagName: tagName()
            };
            content: myContent
          "
        ></ng-container>
      </ng-container>
       <ng-container *ngIf="!tagNameIsString() && dynamicTagName() === ''">
        <ng-container
          *ngComponentOutlet="
            effectiveTagName();
            inputs: {
              attributes: attributes(),
              actionAttributes: actionAttributes(),
            };
            content: myContent
          "
        ></ng-container>
      </ng-container>
    </ng-container>
    <ng-container *ngIf="!!isEmptyElement(effectiveTagName())">
      <ng-container
        *ngComponentOutlet="
          effectiveTagName();
          inputs: {
            attributes: attributes(),
            actionAttributes: actionAttributes(),
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

  TagName = input.required<any>();
  attributes = input.required<any>();
  actionAttributes = input.required<any>();
  tagName = signal<string>('');

  tagnameTemplateRef = viewChild<TemplateRef<any>>('tagnameTemplate');
  private _processedTagName = signal<any>(null);

  myContent?: any[][];

  tagNameIsString = computed(() => typeof this.TagName() === 'string');
  
  dynamicTagName = computed(() => this.tagName());
  
  effectiveTagName = computed(() => this._processedTagName());
  
  mappedComponent = computed(() => {
    if (this.tagNameIsString()) {
      return this.getComponentType(this.TagName());
    }
    return null;
  });

  constructor(private vcRef: ViewContainerRef) {}

  private tagComponentMap: { [key: string]: any } = {
    ${htmlElements.map((el) => `'${el}': Dynamic${capitalize(el)}`).join(',\n    ')}
  };

  getComponentType(tagName: string): any {
    return this.tagComponentMap[tagName] || null;
  }

  ngOnInit() {
    if (this.tagNameIsString()) {
      if (this.tagComponentMap[this.TagName()]) {
        this._processedTagName.set(this.tagComponentMap[this.TagName()]);
      } else {
        this.tagName.set(this.TagName());
        this._processedTagName.set(DynamicElement);
      }
    } else {
      this._processedTagName.set(this.TagName());
    }
    this.myContent = [this.vcRef.createEmbeddedView(this.tagnameTemplateRef()).rootNodes];
  }
}
`;

  htmlElements.forEach((tagName) => {
    dynamicRendererCode += dynamicComponentTemplate(tagName) + '\n';
  });

  dynamicRendererCode += `
  @Component({
      selector: 'dynamic-element',
      template: '<ng-content></ng-content>',
      standalone: true
    })

    export class DynamicElement {
      tagName = input<string>();
      attributes = input<any>();
      actionAttributes = input<any>();
    
      private _element!: HTMLElement;
      private _listenerFns = new Map<string, () => void>();
    
      constructor(private hostRef: ElementRef, private renderer: Renderer2) {}
    
      ngOnInit() {
        if(this.tagName()){
          this._element = this.renderer.createElement(this.tagName());
          this.renderer.appendChild(this.hostRef.nativeElement, this._element);
          this.setAttributes(this._element, this.attributes());
        }
      }

      ngAfterViewInit(){
        if(this.hostRef.nativeElement.children.length > 1){
          this.renderer.appendChild(this.hostRef.nativeElement.children[1], this.hostRef.nativeElement.children[0]);
        }
      }
    
      ngOnDestroy() {
        this._listenerFns.forEach((fn) => fn());
      }
    
      setAttributes(el: any, attributes: any) {
        if (!attributes) return;
        Object.keys(attributes).forEach((key) => {
          if (key.startsWith('on')) {
            if (this._listenerFns.has(key)) {
              this._listenerFns.get(key)!();
            }
            const eventType = key.replace('on', '').toLowerCase();
            this._listenerFns.set(key, this.renderer.listen(el, eventType, attributes[key]));
          } else {
            this.renderer.setAttribute(el, key, attributes[key] ?? '');
          }
        });
      }
    }`;

  fs.writeFileSync(PATH_TO_DYNAMIC_RENDERER, dynamicRendererCode);

  console.log('Dynamic renderer generated successfully!');
};

generateComponents();
