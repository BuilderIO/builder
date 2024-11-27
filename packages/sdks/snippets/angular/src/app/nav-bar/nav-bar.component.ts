import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { fetchOneEntry, type BuilderContent } from '@builder.io/sdk-angular';
import { NavLinksComponent } from './nav-links/nav-links.component';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [CommonModule, NavLinksComponent],
  template: `
    <nav
      style="display: flex; justify-content: space-between; align-items: center; padding: 1rem;"
    >
      <div class="brand-name">
        <h1>Acme company</h1>
      </div>

      <app-nav-links [links]="links" />

      <div style="display: flex; gap: 10px;">
        <button>Login</button>
        <button>Register</button>
      </div>
    </nav>
  `,
})
export class NavBarComponent {
  links: BuilderContent = { data: { links: [] } };

  async ngOnInit() {
    this.links =
      (await fetchOneEntry({
        model: 'navigation-links',
        apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
      })) || this.links;
  }
}
