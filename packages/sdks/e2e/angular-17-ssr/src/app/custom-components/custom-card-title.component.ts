import { Component } from '@angular/core';

@Component({
  selector: 'h2[custom-card-title]',
  template: ` <ng-content></ng-content> `,
  styles: [
    `
      :host {
        font-size: 1.5em;
        margin-bottom: 0.5em;
        color: #333;
      }
    `,
  ],
})
export class CustomCardTitleComponent {}
