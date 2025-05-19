import { Component } from '@angular/core';

@Component({
  selector: 'div[custom-card]',
  template: ` <ng-content></ng-content> `,
  styles: [
    `
      :host {
        border: 1px solid #ccc;
        border-radius: 4px;
        padding: 16px;
        margin-bottom: 16px;
      }
    `,
  ],
})
export class CustomCardComponent {}
