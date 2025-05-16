import { CommonModule } from '@angular/common';
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
  imports: [Content, CommonModule],
  template: `
    <builder-content
      *ngIf="content || isPreviewing(); else notFound"
      [model]="model"
      [content]="content"
      [apiKey]="apiKey"
    ></builder-content>
    <ng-template #notFound>
      <div>404</div>
    </ng-template>
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