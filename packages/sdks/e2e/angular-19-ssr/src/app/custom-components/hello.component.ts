import { Component } from '@angular/core';

@Component({
  selector: 'hello',
  template: ` <h1>hello {{ name }}<ng-content></ng-content></h1> `,
})
export class HelloComponent {
  name = 'World';
}
