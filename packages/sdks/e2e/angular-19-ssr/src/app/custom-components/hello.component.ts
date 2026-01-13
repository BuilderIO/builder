import { Component, Input } from '@angular/core';

@Component({
  selector: 'hello',
  template: ` <h1>hello {{ context?.builderContent?.data?.title || 'World' }}<ng-content></ng-content></h1> `,
})
export class HelloComponent {
  @Input() context: any;
}
