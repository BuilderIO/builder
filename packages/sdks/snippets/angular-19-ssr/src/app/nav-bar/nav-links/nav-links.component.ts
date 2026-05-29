import { Component, input } from '@angular/core';
import { type BuilderContent } from '@builder.io/sdk-angular';

@Component({
  selector: 'app-nav-links',
  standalone: true,
  imports: [],
  template: `
    <ul>
      @for (link of links().data?.['links']; track link.url) {
        <li>
          <a [href]="link.url">{{ link.text }}</a>
        </li>
      }
    </ul>
  `,
})
export class NavLinksComponent {
  links = input<BuilderContent>({ data: { links: [] } });
}
