import { Component, inject, type OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  Content,
  fetchOneEntry,
  type BuilderContent,
} from '@builder.io/sdk-angular';
import { BuilderFetchService } from '../builder-fetch.service';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [Content],
  template: `
    @if (content) {
      <div>
        <builder-content
          [content]="content"
          [model]="modelName"
          [apiKey]="apiKey"
        />
      </div>
    }
    @if (notFound) {
      <div>404</div>
    }
  `,
})
export class HomepageComponent implements OnInit {
  private router = inject(Router);
  private builderFetch = inject(BuilderFetchService);

  apiKey = 'ee9f13b4981e489a9a1209887695ef2b';
  modelName = 'page';

  content: BuilderContent | null = null;
  notFound = false;

  async ngOnInit() {
    this.content = await fetchOneEntry({
      model: this.modelName,
      apiKey: this.apiKey,
      userAttributes: {
        urlPath: this.router.url,
      },
      fetch: this.builderFetch.fetch,
    });

    this.notFound = !this.content;
  }
}
