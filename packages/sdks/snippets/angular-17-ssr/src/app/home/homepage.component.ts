import { Component } from '@angular/core';
import {
  Content,
  fetchOneEntry,
  isPreviewing,
  type BuilderContent,
} from '@builder.io/sdk-angular';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [Content],
  template: `
    @if (content || isPreviewing()) {
      <builder-content
        [model]="model"
        [content]="content"
        [apiKey]="apiKey"
      ></builder-content>
    } @else {
      <div>404</div>
    }
  `,
})
export class HomepageComponent {
  content: BuilderContent | null = null;

  model = 'homepage';
  apiKey = 'ee9f13b4981e489a9a1209887695ef2b';

  isPreviewing = isPreviewing;

  async ngOnInit() {
    this.content = await fetchOneEntry({
      model: this.model,
      apiKey: this.apiKey,
    });
  }
}
