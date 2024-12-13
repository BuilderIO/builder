import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { fetchEntries, type BuilderContent } from '@builder.io/sdk-angular';
import { NavLinksComponent } from './nav-links/nav-links.component';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [CommonModule, NavLinksComponent],
  template: `
    <nav>
      <app-nav-links [links]="links" />
      <!-- <RestOfYourPage /> -->
    </nav>
  `,
})
export class NavBarComponent {
  links: BuilderContent[] = [];
  async ngOnInit() {
    this.links =
      (await fetchEntries({
        model: 'nav-link',
        apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
      })) || this.links;
  }
}
