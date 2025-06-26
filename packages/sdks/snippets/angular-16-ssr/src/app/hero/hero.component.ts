import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  Content,
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
        [model]="model"
        [content]="productHero"
        [apiKey]="apiKey"
      ></builder-content>
    </div>
    <ng-template #notFound>
      <div>404</div>
    </ng-template>
    <!-- The rest of your page goes here -->
  `,
})
export class HeroComponent implements OnInit {
  productHero: BuilderContent | null = null;
  model = 'collection-hero';
  apiKey = 'ee9f13b4981e489a9a1209887695ef2b';

  isPreviewing = isPreviewing;

  constructor(private route: ActivatedRoute) {}

  async ngOnInit() {
    this.route.data.subscribe((data: any) => {
      this.productHero = data.content;
    });
  }
}