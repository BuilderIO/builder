import { Component, inject, type OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  Content,
  fetchOneEntry,
  type BuilderContent,
} from '@builder.io/sdk-angular';
import { BuilderFetchService } from '../builder-fetch.service';

@Component({
  selector: 'app-blog-article',
  standalone: true,
  imports: [Content],
  template: `
    @if (article) {
      <div>
        <builder-content
          [content]="article"
          [model]="model"
          [apiKey]="apiKey"
        />
      </div>
    } @else {
      <div>Article not found</div>
    }
  `,
})
export class BlogArticleComponent implements OnInit {
  private router = inject(Router);
  private builderFetch = inject(BuilderFetchService);

  apiKey = 'ee9f13b4981e489a9a1209887695ef2b';
  model = 'blog-article';
  article: BuilderContent | null = null;

  async ngOnInit() {
    const urlPath = this.router.url || '';

    this.article = await fetchOneEntry({
      model: this.model,
      apiKey: this.apiKey,
      userAttributes: {
        urlPath,
      },
      fetch: this.builderFetch.fetch,
    });
  }
}
