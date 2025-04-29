import { Component } from '@angular/core';

@Component({
  selector: 'custom-button',
  template: `<button><ng-content /></button>`,
  standalone: true,
})
export class CustomButtonComponent {} 