import { Component } from '@angular/core';

@Component({
  selector: 'custom-card-title',
  template: `
    <div class="card-title">
      <ng-content />
    </div>
  `,
  standalone: true,
})
export class CustomCardTitleComponent {}
