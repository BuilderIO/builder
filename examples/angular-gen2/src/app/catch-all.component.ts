import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpResponse } from '@angular/common/http';
import {
  Content,
  _processContentResult,
  fetchOneEntry,
  getBuilderSearchParams,
  type RegisteredComponent,
  type BuilderContent,
} from '@builder.io/sdk-angular';
import { firstValueFrom, retry } from 'rxjs';
import { customComponents } from '../../../../packages/sdks/e2e/angular-19-ssr/src/app/custom-components';
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
        [customComponents]="customComponents"
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
    customComponents: RegisteredComponent[] = customComponents;

    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private http = inject(HttpClient);

    httpClientFetch=async (url: string, options: RequestInit) => {
        return firstValueFrom(
          this.http.request<any>(options.method || 'GET', url, {
            body: options.body,
            headers: options.headers as any,
            ...options,
            observe: 'response', 
            responseType: 'json',
          })
        ).then((response: HttpResponse<any>) => {
          return {
            ok: response.status >= 200 && response.status < 300,
            status: response.status,
            json: () => Promise.resolve(response.body),
          };
        });
      };

  async ngOnInit() {
    const urlPath = this.router.url.split('?')[0] || '';

    const queryParams = this.route.snapshot.queryParams;
    const searchParams = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, value]) => {
      searchParams.append(key, value as string);
    });

    const builderContent = await fetchOneEntry({
        model: 'page',
        apiKey: this.apiKey,
        options: getBuilderSearchParams(searchParams),
        userAttributes: { urlPath },
        fetch: this.httpClientFetch,
      });
  
      if (!builderContent) {
        return;
      }
  
      this.content = builderContent;
  }
}
