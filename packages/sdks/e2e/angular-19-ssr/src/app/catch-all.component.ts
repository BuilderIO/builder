import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// fails because type imports cannot be injected
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { HttpClient, HttpResponse } from '@angular/common/http';
import {
  Content,
  _processContentResult,
  fetchOneEntry,
  getBuilderSearchParams,
  type RegisteredComponent,
} from '@builder.io/sdk-angular';
import { getProps } from '@sdk/tests';
import { firstValueFrom } from 'rxjs';
import { customComponents } from './custom-components';

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
        [trustedHosts]="trustedHosts"
        [canTrack]="canTrack"
        [customComponents]="customComponents"
        [data]="data"
        [apiHost]="apiHost"
        [locale]="locale"
      ></builder-content>
    } @else {
      <div>404 - Content not found</div>
    }
  `,
  imports: [Content],
})
export class CatchAllComponent {
  canTrack: BuilderProps['canTrack'];
  trustedHosts: BuilderProps['trustedHosts'];
  apiKey: BuilderProps['apiKey'] = 'abcd';
  model: BuilderProps['model'] = 'page';
  content: BuilderProps['content'];
  data: BuilderProps['data'];
  apiHost: BuilderProps['apiHost'];
  locale: BuilderProps['locale'];
  customComponents: RegisteredComponent[] = customComponents;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);

  // Example usage of HttpClient and overriding fetch in fetchOneEntry
  _httpClientFetch = async (url: string, options: RequestInit) => {
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

    const builderProps = await getProps({
      pathname: urlPath,
      _processContentResult,
      options: getBuilderSearchParams(searchParams),
      // data: 'real',
      // apiKey: 'ad30f9a246614faaa6a03374f83554c9',
      fetchOneEntry: (args) => {
        return fetchOneEntry({
          ...args,
          fetch: this._httpClientFetch,
        });
      },
    });

    if (!builderProps) {
      return;
    }

    this.content = builderProps.content;
    this.canTrack = builderProps.canTrack;
    this.trustedHosts = builderProps.trustedHosts;
    this.apiKey = builderProps.apiKey;
    this.model = builderProps.model;
    this.data = builderProps.data;
    this.apiHost = builderProps.apiHost;
    this.locale = builderProps.locale;
  }
}
