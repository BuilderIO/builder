/**
 * Quickstart snippet
 * snippets/angular-16-ssr/src/app/catch-all/catch-all.component.ts
 */

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  Content,
  isPreviewing,
  type BuilderContent,
} from '@builder.io/sdk-angular';

@Component({
  selector: 'app-catchall',
  standalone: true,
  imports: [Content, CommonModule],
  template: `
    <ng-container *ngIf="canShowContent; else notFound">
      <builder-content
        [model]="model"
        [content]="content"
        [apiKey]="apiKey"
      ></builder-content>
    </ng-container>

    <ng-template #notFound> 404 </ng-template>
  `,
})
export class CatchAllComponent {
  apiKey = 'ee9f13b4981e489a9a1209887695ef2b';
  model = 'page';
  content: BuilderContent | null = null;
  canShowContent = false;

  constructor(private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.activatedRoute.data.subscribe((data: any) => {
      this.content = data.content;
      const searchParams = this.activatedRoute.snapshot.queryParams;
      this.canShowContent = !!this.content || isPreviewing(searchParams);
    });
  }
}
