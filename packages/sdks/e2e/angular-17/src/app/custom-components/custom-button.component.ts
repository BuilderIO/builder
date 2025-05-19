import { Component } from '@angular/core';

@Component({
  selector: 'button[custom-button]',
  template: `
    <span>
      <ng-content></ng-content>
    </span>
  `,
})
export class CustomButtonComponent {}
