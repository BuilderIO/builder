/**
 * Quickstart snippet
 * snippets/angular-ssr/src/app/catch-all/catch-all.component.ts
 */

import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { type BuilderContent } from '@builder.io/sdk-angular';

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

  constructor(private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.activatedRoute.data.subscribe((data: any) => {
      this.content = data.content;
    });
  }
}
