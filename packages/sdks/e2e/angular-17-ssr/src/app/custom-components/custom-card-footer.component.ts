import { Component } from '@angular/core';

@Component({
  selector: 'custom-card-footer',
  template: `
    <div class="card-footer">
      <ng-content />
    </div>
  `,
  standalone: true,
})
export class CustomCardFooterComponent {}
