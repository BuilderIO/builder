import { Component, Input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'text',
  template: `
  <div>
    {{ text }}
  </div>
  `,
})
export class TextComponent {
  @Input() text: string = '';
}
