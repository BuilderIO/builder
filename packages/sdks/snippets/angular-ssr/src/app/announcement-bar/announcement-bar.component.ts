/**
 * https://www.builder.io/c/docs/integrate-section-building
 * https://www.builder.io/c/blueprints/announcement-bar
 * src/app/announcement-bar/announcement-bar.component.ts
 */

import { isPlatformServer } from '@angular/common';
// fails because type imports cannot be injected
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import {
  ChangeDetectorRef,
  Component,
  Inject,
  Optional,
  PLATFORM_ID,
} from '@angular/core';
import {
  fetchOneEntry,
  getBuilderSearchParams,
  type BuilderContent,
} from '@builder.io/sdk-angular';
import { REQUEST } from '@nguniversal/express-engine/tokens';

@Component({
  selector: 'app-announcement-bar',
  template: `
    <ng-container *ngIf="content; else notFound">
      <content-variants
        [model]="model"
        [content]="content"
        [apiKey]="apiKey"
      ></content-variants>
    </ng-container>

    <ng-template #notFound>
      <div>Announcement Bar not Found</div>
    </ng-template>

    <!-- Your content coming from your app (or also Builder) -->
    <div>The rest of your page goes here</div>
  `,
})
export class AnnouncementBarComponent {
  apiKey = 'ee9f13b4981e489a9a1209887695ef2b';
  model = 'announcement-bar';
  content: BuilderContent | null = null;

  constructor(
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: any,
    @Optional() @Inject(REQUEST) private req: any
  ) {
    const urlPath = isPlatformServer(this.platformId)
      ? this.req.path || ''
      : window.location.pathname;
    const searchParams = isPlatformServer(this.platformId)
      ? new URLSearchParams(this.req.url.split('?')[1])
      : new URLSearchParams(window.location.search);

    fetchOneEntry({
      apiKey: this.apiKey,
      model: this.model,
      userAttributes: { urlPath },
      options: getBuilderSearchParams(searchParams),
    }).then((content) => {
      this.content = content;
    });
  }

  async ngOnInit() {
    this.cdr.detectChanges();
  }
}
