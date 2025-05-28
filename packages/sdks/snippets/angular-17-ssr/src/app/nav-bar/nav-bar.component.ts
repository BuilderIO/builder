import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { fetchOneEntry, type BuilderContent } from '@builder.io/sdk-angular';
import { BuilderFetchService } from '../builder-fetch.service';
import { NavLinksComponent } from './nav-links/nav-links.component';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [NavLinksComponent],
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
  private router = inject(Router);
  private builderFetch = inject(BuilderFetchService);

  apiKey = 'ee9f13b4981e489a9a1209887695ef2b';
  model = 'nav-bar';
  navContent: BuilderContent | null = null;
  links: BuilderContent = { data: { links: [] } };

  async ngOnInit() {
    const urlPath = this.router.url || '';

    this.navContent = await fetchOneEntry({
      model: this.model,
      apiKey: this.apiKey,
      userAttributes: {
        urlPath,
      },
      fetch: this.builderFetch.fetch,
    });

    if (!this.navContent) {
      this.links =
        (await fetchOneEntry({
          model: 'navigation-links',
          apiKey: this.apiKey,
          fetch: this.builderFetch.fetch,
        })) || this.links;
    }
  }
}
