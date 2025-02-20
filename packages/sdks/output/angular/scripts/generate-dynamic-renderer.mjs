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

const dynamicRendererImports = [
  `import { CommonModule } from '@angular/common';`,
  `import { Component, ElementRef, Input, Renderer2, SimpleChanges, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';`,
  `import { isEmptyElement } from './dynamic-renderer.helpers';`,
];

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
              actionAttributes: actionAttributes,
              tagName: tagName
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
              actionAttributes: actionAttributes,
              tagName: tagName
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
            actionAttributes: actionAttributes,
            tagName: tagName
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
  @Input() tagName : string;

  @ViewChild('tagnameTemplate', { static: true }) tagnameTemplateRef!: TemplateRef<any>;

  myContent?: any[][];

  useTypeOf(obj: any): string {
    return typeof obj;
  }

  constructor(private vcRef: ViewContainerRef) {}

  ngOnInit() {
    if (typeof this.TagName === 'string') {
      this.tagName = this.TagName;
      this.TagName = DynamicElement
    }
    this.myContent = [this.vcRef.createEmbeddedView(this.tagnameTemplateRef).rootNodes];
  }
}
`;

  dynamicRendererCode += `
  @Component({
      selector: 'dynamic-element',
      template: '<ng-content></ng-content>',
      standalone: true
    })

    export class DynamicElement {
      @Input() tagName: string;
      @Input() attributes: any;
      @Input() actionAttributes: any;
    
      private _element!: HTMLElement;
      private _listenerFns = new Map<string, () => void>();
    
      constructor(private hostRef: ElementRef, private renderer: Renderer2) {}
    
      ngOnInit() {
        this._element = this.renderer.createElement(this.tagName);
        this.renderer.appendChild(this.hostRef.nativeElement, this._element);
        this.setAttributes(this._element, this.attributes);
      }

      ngAfterViewInit(){
        this.renderer.appendChild(this.hostRef.nativeElement.children[1], this.hostRef.nativeElement.children[0]);
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
    }`

  fs.writeFileSync(PATH_TO_DYNAMIC_RENDERER, dynamicRendererCode);

  console.log('Dynamic renderer generated successfully!');
};

generateComponents();
