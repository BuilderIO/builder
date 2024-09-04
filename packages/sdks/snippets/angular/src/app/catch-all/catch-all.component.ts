/**
 * Quickstart snippet
 * snippets/angular/src/app/catch-all/catch-all.component.ts
 */

import { Component } from '@angular/core';
import { fetchOneEntry, type BuilderContent } from '@builder.io/sdk-angular';

@Component({
  selector: 'app-catchall',
  template: `
    <ng-container *ngIf="content; else notFound">
      <content [model]="model" [content]="content" [apiKey]="apiKey"></content>
    </ng-container>

    <ng-template #notFound>
      <div>404 - Content not found</div>
    </ng-template>
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
