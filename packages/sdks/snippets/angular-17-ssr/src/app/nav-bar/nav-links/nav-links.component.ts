import { Component, Input } from '@angular/core';
import { type BuilderContent } from '@builder.io/sdk-angular';

@Component({
  selector: 'app-nav-links',
  standalone: true,
  imports: [],
  template: `
    <ul style="display: flex; gap: 20px; list-style: none;">
      @for (link of links.data?.['links']; track link.url) {
        <li>
          <a [href]="link.url" style="text-decoration: none;">{{
            link.text
          }}</a>
        </li>
      }
    </ul>
  `,
})
export class NavLinksComponent {
  @Input() links: BuilderContent = { data: { links: [] } };
}
