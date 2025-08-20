import { CommonModule } from '@angular/common';
import { Component, type OnInit } from '@angular/core';
import {
  Content,
  fetchOneEntry,
  isPreviewing,
  type BuilderContent,
} from '@builder.io/sdk-angular';
import { customHeroInfo } from './custom-hero/custom-hero.component';

@Component({
  selector: 'app-custom-child',
  standalone: true,
  imports: [Content, CommonModule],
  template: `
    <div *ngIf="!notFound">
      <builder-content
        [content]="content"
        [model]="model"
        [apiKey]="apiKey"
        [customComponents]="[customHeroInfo]"
      ></builder-content>
    </div>
    <div *ngIf="notFound">404 Not Found</div>
  `,
})
export class CustomChildComponent implements OnInit {
  notFound = false;
  content: BuilderContent | null = null;
  customHeroInfo = customHeroInfo;
  model = 'page';
  apiKey = 'ee9f13b4981e489a9a1209887695ef2b';

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
