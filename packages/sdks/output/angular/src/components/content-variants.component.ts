import { Component } from '@angular/core';
import { TextComponent } from '../blocks/text/text.component';

@Component({
  selector: 'content-variants',
  standalone: true,
  template: `
  <text [text]="'Hello world!'"></text>
  `,
  imports: [TextComponent],
})
export class ContentVariantsComponent {

}
