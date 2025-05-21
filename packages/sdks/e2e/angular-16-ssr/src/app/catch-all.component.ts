import { Component } from '@angular/core';
// fails because type imports cannot be injected
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { ActivatedRoute } from '@angular/router';
import type { RegisteredComponent } from '@builder.io/sdk-angular';
import { registerAction } from '@builder.io/sdk-angular';
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
  template: `
    <ng-container *ngIf="content; else notFound">
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
    </ng-container>

    <ng-template #notFound>
      <div>404 - Content not found</div>
    </ng-template>
  `,
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

  constructor(private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    if (typeof window !== 'undefined') {
      registerAction({
        name: 'test-action',
        kind: 'function',
        id: 'test-action-id',
        inputs: [
          {
            name: 'actionName',
            type: 'string',
            required: true,
            helperText: 'Action name',
          },
        ],
        action: () => {
          return `console.log("function call") `;
        },
      });
    }
    this.activatedRoute.data.subscribe((data: any) => {
      this.content = data.content?.content;
      this.canTrack = data.content?.canTrack;
      this.trustedHosts = data.content?.trustedHosts;
      this.data = data.content?.data;
      this.apiHost = data.content?.apiHost;
      this.model = data.content?.model;
      this.locale = data.content?.locale;
    });
  }
}
