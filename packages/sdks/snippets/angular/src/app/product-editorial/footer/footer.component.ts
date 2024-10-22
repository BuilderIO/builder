import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <div
      style="display: flex; 
      justify-content: center; 
      align-items: center; 
      padding: 0.2rem; 
      background-color: #f0f0f0; 
      border-top: 1px solid #e0e0e0; 
      margin: 1rem 0;"
    >
      <p>© 2024 Acme Corp. All rights reserved.</p>
    </div>
  `,
})
export class FooterComponent {}
