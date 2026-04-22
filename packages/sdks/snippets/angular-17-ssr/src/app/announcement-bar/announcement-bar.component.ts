/**
 * https://www.builder.io/c/docs/integrate-section-building
 * https://www.builder.io/c/blueprints/announcement-bar
 * src/app/announcement-bar/announcement-bar.component.ts
 */

import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  Content,
  fetchOneEntry,
  type BuilderContent,
} from '@builder.io/sdk-angular';
import { BuilderFetchService } from '../builder-fetch.service';

@Component({
  selector: 'app-announcement-bar',
  standalone: true,
  imports: [Content],
  template: `
    @if (content) {
      <builder-content
        [model]="model"
        [content]="content"
        [apiKey]="apiKey"
      ></builder-content>
    }

    <!-- Your content coming from your app (or also Builder) -->
    <div>The rest of your page goes here</div>
  `,
})
export class AnnouncementBarComponent {
  private router = inject(Router);
  private builderFetch = inject(BuilderFetchService);

  apiKey = 'ee9f13b4981e489a9a1209887695ef2b';
  model = 'announcement-bar';
  content: BuilderContent | null = null;

  async ngOnInit() {
    const urlPath = this.router.url || '';

    const content = await fetchOneEntry({
      apiKey: this.apiKey,
      model: this.model,
      userAttributes: {
        urlPath,
      },
      fetch: this.builderFetch.fetch,
    });

    if (!content) {
      return;
    }

    this.content = content;
  }
}
