import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  Content,
  fetchOneEntry,
  type BuilderContent,
} from '@builder.io/sdk-angular';

@Component({
  selector: 'app-blog-article',
  standalone: true,
  imports: [Content, CommonModule],
  template: `<div *ngIf="article" class="content">
    <h1>{{ article.data?.title }}</h1>
    <p>{{ article.data?.['blurb'] }}</p>
    <img [src]="article.data?.['image']" alt="" />
    <builder-content [model]="model" [content]="article"></builder-content>
  </div> `,
})
export class BlogArticleComponent {
  article: BuilderContent | null = null;
  model = 'blog-article';

  async ngOnInit() {
    this.article = await fetchOneEntry({
      model: this.model,
      apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
      query: {
        'data.handle': 'new-product-line',
      },
    });
  }
}
