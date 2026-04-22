import { Component, inject, type OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  Content,
  fetchOneEntry,
  type BuilderContent,
} from '@builder.io/sdk-angular';
import { BuilderFetchService } from '../builder-fetch.service';
import { customHeroInfo } from './custom-hero/custom-hero.component';

@Component({
  selector: 'app-custom-child',
  standalone: true,
  imports: [Content],
  template: `
    @if (content) {
      <div>
        <builder-content
          [content]="content"
          [model]="modelName"
          [apiKey]="apiKey"
          [customComponents]="customComponents"
        />
      </div>
    }
    @if (notFound) {
      <div>404</div>
    }
  `,
})
export class CustomChildComponent implements OnInit {
  private router = inject(Router);
  private builderFetch = inject(BuilderFetchService);

  apiKey = 'ee9f13b4981e489a9a1209887695ef2b';
  modelName = 'page';

  content: BuilderContent | null = null;
  notFound = false;
  customComponents = [customHeroInfo];

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
