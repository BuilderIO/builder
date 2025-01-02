import { Component } from '@angular/core';

@Component({
  selector: 'div[custom-card-footer]',
  template: `
    <div class="card-footer">
      <ng-content></ng-content>
    </div>
  `,
  styles: [
    `
      .card-footer {
        margin-top: 16px;
        padding-top: 8px;
        border-top: 1px solid #eee;
      }
    `,
  ],
})
export class CustomCardFooterComponent {}
