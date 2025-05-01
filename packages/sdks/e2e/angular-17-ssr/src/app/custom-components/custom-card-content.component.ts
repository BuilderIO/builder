import { Component } from '@angular/core';

@Component({
  selector: 'custom-card-content',
  template: `
    <div class="card-content">
      <ng-content />
    </div>
  `,
  standalone: true,
})
export class CustomCardContentComponent {}
