import { Component, Input } from '@angular/core';

@Component({
  selector: 'hello',
  template: ` <div>hello {{ context?.builderContent?.data?.title || 'World' }}</div> `,
})
export class HelloComponent {
  @Input() context: any;
}
