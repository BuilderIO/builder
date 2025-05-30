import { Component, inject, type OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  Content,
  fetchOneEntry,
  isPreviewing,
  type BuilderContent,
} from '@builder.io/sdk-angular';
import { customColumnsInfo } from './custom-columns/custom-columns.component';

@Component({
  selector: 'app-editable-region',
  standalone: true,
  imports: [Content],
  template: `
    @if (content || isPreviewing()) {
      <builder-content
        [content]="content"
        [model]="model"
        [apiKey]="apiKey"
        [customComponents]="customComponents"
      />
    }
    @if (notFound) {
      <div>404</div>
    }
  `,
})
export class EditableRegionComponent implements OnInit {
  model = 'page';
  apiKey = 'ee9f13b4981e489a9a1209887695ef2b';
  customComponents = [customColumnsInfo];
  notFound = false;
  content: BuilderContent | null = null;

  router = inject(Router);
  isPreviewing = isPreviewing;

  async ngOnInit() {
    const urlPath = this.router.url.split('?')[0] || '';
    this.content = await fetchOneEntry({
      model: this.model,
      apiKey: this.apiKey,
      userAttributes: {
        urlPath,
      },
    });
    this.notFound = !this.content;
  }
}
