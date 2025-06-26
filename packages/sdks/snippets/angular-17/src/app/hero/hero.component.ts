import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  Content,
  fetchOneEntry,
  isPreviewing,
  type BuilderContent,
} from '@builder.io/sdk-angular';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [Content],
  template: `
    <!-- Your nav goes here -->
    <!-- Hero Section -->
    @if (productHero || isPreviewing()) {
      <builder-content
        [model]="model"
        [content]="productHero"
        [apiKey]="apiKey"
      ></builder-content>
    } @else {
      <div>404</div>
    }
    <!-- The rest of your page goes here -->
  `,
})
export class HeroComponent {
  productHero: BuilderContent | null = null;

  isPreviewing = isPreviewing;
  model = 'collection-hero';
  apiKey = 'ee9f13b4981e489a9a1209887695ef2b';

  private router = inject(Router);

  async ngOnInit() {
    this.productHero = await fetchOneEntry({
      model: this.model,
      apiKey: this.apiKey,
      userAttributes: {
        urlPath: this.router.url,
      },
    });
  }
}
