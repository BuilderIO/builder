/**
 * Quickstart snippet
 * snippets/angular-ssr/src/app/app.component.ts
 */

// fails because type imports cannot be injected
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { ChangeDetectorRef, Component } from '@angular/core';
import { fetchOneEntry, type BuilderContent } from '@builder.io/sdk-angular';

@Component({
  selector: 'app-root',
  template: `
    <ng-container *ngIf="content; else notFound">
      <content-variants
        [model]="model"
        [content]="content"
        [apiKey]="apiKey"
      ></content-variants>
    </ng-container>

    <ng-template #notFound>
      <div>404 - Content not found</div>
    </ng-template>
  `,
})
export class AppComponent {
  apiKey = 'f1a790f8c3204b3b8c5c1795aeac4660';
  model = 'page';
  content: BuilderContent | null = null;

  constructor(private cdr: ChangeDetectorRef) {}

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
    this.cdr.detectChanges();
  }
}
