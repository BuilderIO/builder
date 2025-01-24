import { Component } from '@angular/core';

@Component({
  selector: 'div[custom-card-content]',
  template: `
    <div class="card-content">
      <ng-content></ng-content>
    </div>
  `,
  styles: [
    `
      .card-content {
        padding: 8px 0;
      }
    `,
  ],
})
export class CustomCardContentComponent {}
