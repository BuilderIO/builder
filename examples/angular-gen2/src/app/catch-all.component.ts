import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Content,
  _processContentResult,
  fetchOneEntry,
  getBuilderSearchParams,
  type BuilderContent,
} from '@builder.io/sdk-angular';


import { environment } from '../environments/environment';

interface BuilderProps {
  apiVersion: string;
  canTrack?: boolean;
  trustedHosts?: undefined;
  apiKey: string;
  model: string;
  content: any;
  data?: any;
  apiHost?: string;
  locale?: string;
}

@Component({
  selector: 'catch-all-route',
  standalone: true,
  template: `
    @if (content) {
      <builder-content
        [model]="model"
        [content]="content"
        [apiKey]="apiKey"
      ></builder-content>
    } @else {
      <div>404 - Content not found</div>
    }
  `,
  imports: [Content],
})
export class CatchAllComponent {
    model = "page";
    apiKey = environment.builderApiKey;
    content: BuilderContent | null = null;

    private route = inject(ActivatedRoute);
    private router = inject(Router);

  async ngOnInit() {
    const urlPath = this.router.url.split('?')[0] || '';

    const queryParams = this.route.snapshot.queryParams;
    const searchParams = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, value]) => {
      searchParams.append(key, value as string);
    });

    const builderContent = await fetchOneEntry({
      model: this.model,
      apiKey: this.apiKey,
      options: getBuilderSearchParams(new URLSearchParams(window.location.search)),
      userAttributes: { urlPath: window.location.pathname },
    });

    if (!builderContent) {
      return;
    }

    this.content = builderContent;
  }
}
