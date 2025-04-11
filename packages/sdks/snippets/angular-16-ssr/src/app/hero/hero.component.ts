import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Content, type BuilderContent } from '@builder.io/sdk-angular';
@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [Content, CommonModule],
  template: `
    <!-- Your nav goes here -->
    <!-- Hero Section -->
    <builder-content
      *ngIf="productHero"
      [model]="model"
      [content]="productHero"
      [apiKey]="apiKey"
    ></builder-content>
    <!-- The rest of your page goes here -->
  `,
})
export class HeroComponent implements OnInit {
  productHero: BuilderContent | null = null;
  model = 'collection-hero';
  apiKey = 'ee9f13b4981e489a9a1209887695ef2b';

  constructor(private route: ActivatedRoute) {}

  async ngOnInit() {
    this.route.data.subscribe((data: any) => {
      this.productHero = data.content;
    });
  }
}
