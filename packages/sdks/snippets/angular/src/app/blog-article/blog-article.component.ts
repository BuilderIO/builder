import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Content, fetchOneEntry } from '@builder.io/sdk-angular';

@Component({
  selector: 'app-blog-article',
  standalone: true,
  imports: [Content, CommonModule],
  template: `<div *ngIf="article" class="content">
    <h1>{{ article.data.title }}</h1>
    <p>{{ article.data.blurb }}</p>
    <img [src]="article.data.image" alt="" />
    <content [model]="model" [content]="article"></content>
  </div> `,
})
export class BlogArticleComponent {
  article: any;
  model = 'blog-article';

  constructor() {
  }

  async ngOnInit() {
    const handle = 'new-product-line';
    const article = await fetchOneEntry({
      model: 'blog-article',
      apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
      query: {
        'data.handle': handle,
      },
    });
    this.article = article;
  }
}
