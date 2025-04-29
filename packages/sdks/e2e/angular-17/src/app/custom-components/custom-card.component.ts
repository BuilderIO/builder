import { Component } from '@angular/core';

@Component({
  selector: 'custom-card',
  template: `
    <div class="card">
      <ng-content />
    </div>
  `,
  standalone: true,
})
export class CustomCardComponent {} 