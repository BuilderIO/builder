import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  template: `
    <div
      style="display: flex; 
      justify-content: center; 
      align-items: center; 
      background-color: #f0f0f0; 
      border-bottom: 1px solid #e0e0e0;
      padding: 0.2rem;
      margin: 1rem 0;"
    >
      <h1>Acme Corp</h1>
    </div>
  `,
})
export class HeaderComponent {}
