import { Component } from '@angular/core';

@Component({
  selector: 'hello',
  template: `<h1><ng-content></ng-content></h1>`,
  standalone: true,
})
export class HelloComponent {} 