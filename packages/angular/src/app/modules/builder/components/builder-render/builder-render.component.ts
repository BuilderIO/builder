import {
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  HostBinding,
  HostListener,
  Input,
  OnInit,
  ViewChild,
  ViewContainerRef,
  ComponentFactory,
  ElementRef,
  Renderer2,
  ChangeDetectionStrategy,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import kebabCase from 'lodash-es/kebabCase';

import { Builder } from '@builder.io/sdk';
import omit from 'lodash-es/omit';

// TODO: move to @builder/core
export type Size = 'large' | 'medium' | 'small' | 'xsmall';
export const sizeNames: Size[] = ['xsmall', 'small', 'medium', 'large'];

@Component({
  selector: 'builder-render',
  templateUrl: './builder-render.component.html',
  styleUrls: ['./builder-render.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuilderRenderComponent implements OnInit {
  @ViewChild('container', { read: ViewContainerRef })
  container?: ViewContainerRef;

  componentRef?: ComponentRef<any>;

  @Input() block?: any;
  @Input() size?: Size;

  // @HostBinding('id')
  get id() {
    return this.block && this.block.id && this.block.id.indexOf('builder-') === 0
      ? this.block.id
      : undefined;
  }

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private renderer: Renderer2,
    private sanitizer: DomSanitizer
  ) {}

  @HostBinding('attr.builder-render') componentName?: string;

  @Input()
  set component(name: string) {
    this.componentName = name;
  }

  private componentOptions: object | null = null;

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent) {
    if (Builder.editingPage && Builder.isIframe) {
      event.stopPropagation();
      const component = this.componentInfo;
      if (component) {
        window.parent.postMessage(
          {
            type: 'builder.clickComponent',
            data: {
              component: omit(component, 'class'),
            },
          },
          // TODO: change these to builder domain specified
          // Put in a config that can chagne fro dev vs not
          '*'
        );
      }
    }
    // TODO: post message
  }

  private get componentInfo() {
    const components = Builder.components;
    const component = components.find(item => item.name === this.componentName);
    return component;
  }

  @Input()
  set options(options: object) {
    this.componentOptions = options;
    if (this.componentRef && this.componentOptions) {
      Object.assign(this.componentRef.instance, this.componentOptions);
      this.componentRef.changeDetectorRef.detectChanges();
    }
  }
  get text() {
    const { block } = this;
    const text = block && block.text;
    if (!text) {
      return '';
    }

    return this.sanitizer.bypassSecurityTrustHtml(text) as string;
  }

  trackByFn(index: number, value: any) {
    return value.id;
  }

  // @HostBinding('style')
  get styles() {
    const { block, size } = this;
    const styles = [];
    if (!(block && block.responsiveStyles)) {
      return {};
    }
    // TODO: sizes
    const startIndex = sizeNames.indexOf(size || 'large');
    for (let i = startIndex; i < sizeNames.length; i = i + 1) {
      const name = sizeNames[i];
      styles.push(block.responsiveStyles[name]);
    }

    // On the server apply the initial animation state (TODO: maybe not for load time hm)
    // TODO: maybe /s/ server renders content pages hmm
    const isServer = !Builder.isBrowser;
    let initialAnimationStepStyles: any;
    if (isServer) {
      const animation = block.animations && block.animations[0];
      const firstStep = animation && animation.steps && animation.steps[0];
      const stepStyles = firstStep && firstStep.styles;
      if (stepStyles) {
        initialAnimationStepStyles = stepStyles;
      }
    }
    const allStyles = Object.assign({}, ...styles.reverse(), initialAnimationStepStyles);
    // return allStyles;
    const str = Object.keys(allStyles)
      .filter(key => Boolean(allStyles[key]))
      .reduce((memo, key) => `${memo}${kebabCase(key)}: ${allStyles[key]};`, '');

    return this.sanitizer.bypassSecurityTrustStyle(str);
  }

  @HostBinding('class')
  get classes() {
    const classes: { [key: string]: boolean } = {};
    if (this.text) {
      classes['builder-text'] = true;
    }

    if (this.block && this.block.id && this.block.id.indexOf('builder-') === 0) {
      classes[this.block.id] = true;
    }

    // return classes
    return Object.keys(classes).join(' ');
  }

  loadComponent() {
    // TODO: a tag, custom tags, element attributes/properties
    // Set responsive artboard styles for container element
    const component = this.componentInfo;
    const Class = component && component.class;
    if (Class) {
      let componentFactory: ComponentFactory<any> | null = null;
      try {
        componentFactory = this.componentFactoryResolver.resolveComponentFactory(Class as any);
      } catch (error) {
        // Only show this in the browser
        if (typeof window !== 'undefined') {
          console.warn(
            'No component found matching ' +
              ((component && component.name) || Class.name) +
              ' this is not a big deal, this component may just not yet be on this version of your site.'
          );
        }
      }
      if (componentFactory) {
        const viewContainerRef = this.container!;
        viewContainerRef.clear();
        const componentRef = (this.componentRef = viewContainerRef.createComponent(
          componentFactory
        ));
        if (this.componentOptions) {
          Object.assign(componentRef.instance, this.componentOptions);
        }
      }
    }
  }

  ngOnInit() {
    this.loadComponent();
  }
}
