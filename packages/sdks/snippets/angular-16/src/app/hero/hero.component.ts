import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  Content,
  fetchOneEntry,
  isPreviewing,
  type BuilderContent,
} from '@builder.io/sdk-angular';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [Content, CommonModule],
  template: `
    <!-- Your nav goes here -->
    <!-- Hero Section -->
    <div *ngIf="productHero || isPreviewing(); else notFound">
      <builder-content
        [model]="'collection-hero'"
        [content]="productHero"
        [apiKey]="'ee9f13b4981e489a9a1209887695ef2b'"
      ></builder-content>
    </div>
    <ng-template #notFound>
      <div>404</div>
    </ng-template>
    <!-- The rest of your page goes here -->
  `,
})
export class HeroComponent {
  productHero: BuilderContent | null = null;

  isPreviewing() {
    return isPreviewing();
  }

  async ngOnInit() {
    this.productHero = await fetchOneEntry({
      model: 'collection-hero',
      apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
      userAttributes: {
        urlPath: window.location.pathname,
      },
    });
  }
}
