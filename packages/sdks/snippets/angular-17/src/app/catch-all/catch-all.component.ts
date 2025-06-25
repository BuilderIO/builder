/**
 * Quickstart snippet
 * snippets/angular/src/app/catch-all/catch-all.component.ts
 */

import { Component } from '@angular/core';
import {
  Content,
  fetchOneEntry,
  type BuilderContent,
} from '@builder.io/sdk-angular';

@Component({
  selector: 'app-catchall',
  standalone: true,
  imports: [Content],
  template: `
    @if (content) {
      <builder-content
        [model]="model"
        [content]="content"
        [apiKey]="apiKey"
      ></builder-content>
    } @else {
      <div>404 - Content not found</div>
    }
  `,
})
export class CatchAllComponent {
  apiKey = 'ee9f13b4981e489a9a1209887695ef2b';
  model = 'page';
  content: BuilderContent | null = null;

  async ngOnInit() {
    const urlPath = window.location.pathname || '';

    const content = await fetchOneEntry({
      apiKey: this.apiKey,
      model: this.model,
      userAttributes: {
        urlPath,
      },
    });

    if (!content) {
      return;
    }

    this.content = content;
  }
}
