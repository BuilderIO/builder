import { CommonModule } from '@angular/common';
import { Component, type OnInit } from '@angular/core';
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
  imports: [CommonModule, Content],
  template: `
    <div *ngIf="content">
      <builder-content
        [content]="content"
        [model]="model"
        [apiKey]="apiKey"
        [customComponents]="customComponents"
      />
    </div>
    <div *ngIf="notFound">404</div>
  `,
})
export class EditableRegionComponent implements OnInit {
  model = 'page';
  apiKey = 'ee9f13b4981e489a9a1209887695ef2b';
  customComponents = [customColumnsInfo];
  notFound = false;
  content: BuilderContent | null = null;

  async ngOnInit() {
    this.content = await fetchOneEntry({
      model: this.model,
      apiKey: this.apiKey,
      userAttributes: {
        urlPath: window.location.pathname,
      },
    });
    this.notFound = !this.content && !isPreviewing();
  }
}
