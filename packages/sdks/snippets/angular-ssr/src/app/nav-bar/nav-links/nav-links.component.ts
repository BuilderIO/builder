import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { type BuilderContent } from '@builder.io/sdk-angular';

@Component({
  selector: 'app-nav-links',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ul style="display: flex; gap: 20px; list-style: none;">
      <li *ngFor="let link of links">
        <a [href]="link.data?.['url']" style="text-decoration: none;">{{
          link.data?.['label']
        }}</a>
      </li>
    </ul>
  `,
})
export class NavLinksComponent {
  @Input() links: BuilderContent[] = [];
}
