import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import DynamicRenderer from '../../components/dynamic-renderer/dynamic-renderer';
import { getClassPropName } from '../../functions/get-class-prop-name';
import type { ButtonProps } from './button.types';

@Component({
  selector: 'builder-button, BuilderButton',
  template: `
    <dynamic-renderer
      [attributes]="attrs()"
      [TagName]="link ? builderLinkComponent || 'a' : 'button'"
      [actionAttributes]="useObjectWrapper({})"
    >
      {{ text }}
    </dynamic-renderer>
  `,
  standalone: true,
  imports: [CommonModule, DynamicRenderer],
})
export default class BuilderButton {
  @Input() attributes!: ButtonProps['attributes'];
  @Input() link!: ButtonProps['link'];
  @Input() openLinkInNewTab!: ButtonProps['openLinkInNewTab'];
  @Input() builderLinkComponent!: ButtonProps['builderLinkComponent'];
  @Input() text!: ButtonProps['text'];
  @Input() wrapperProps!: any;

  attrs() {
    return {
      ...this.attributes,
      [getClassPropName()]: `${this.link ? '' : 'builder-button'} ${
        this.attributes[getClassPropName()] || ''
      }`,
      ...(this.link
        ? {
            href: this.link,
            target: this.openLinkInNewTab ? '_blank' : undefined,
            role: 'link',
          }
        : {
            role: 'button',
          }),
    };
  }

  useObjectWrapper(...args: any[]) {
    let obj = {};
    args.forEach((arg) => {
      obj = { ...obj, ...arg };
    });
    return obj;
  }

  // this is needed to set the spread props
  ngOnInit() {
    this.link = this.wrapperProps?.link;
    this.openLinkInNewTab = this.wrapperProps?.openLinkInNewTab;
    this.text = this.wrapperProps?.text;
    this.builderLinkComponent = this.wrapperProps?.builderLinkComponent;
  }
}
