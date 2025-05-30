import { Component, type OnInit } from '@angular/core';
import {
  Content,
  fetchOneEntry,
  type BuilderContent,
} from '@builder.io/sdk-angular';
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
          [model]="model"
          [apiKey]="apiKey"
          [customComponents]="[customHeroInfo]"
        ></builder-content>
      </div>
    }

    @if (notFound) {
      <div>404 Not Found</div>
    }
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

    if (!this.content) {
      this.notFound = true;
    }
  }
}
