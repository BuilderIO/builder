import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DynamicDivProps {
  children?: any;
  attributes: any;
  actionAttributes: any;
  BlockWrapperProps: any;
  builderPath: any;
  builderParentId: any;
  BlocksWrapperProps: any;
  contentWrapperProps: any;
  builderModel: any;
  ref: any;
}

@Component({
  selector: 'dynamic-div, DynamicDiv',
  template: ` <div><ng-content></ng-content></div> `,
  standalone: true,
  imports: [CommonModule],
})
export default class DynamicDiv {}
