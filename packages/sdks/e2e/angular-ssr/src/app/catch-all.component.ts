import { Component } from '@angular/core';
// fails because type imports cannot be injected
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { ActivatedRoute } from '@angular/router';
import type { RegisteredComponent } from '@builder.io/sdk-angular';
import { BuilderBlockWithClassNameComponent } from './builder-block-with-class-name.component';
import { HelloComponent } from './hello.component';

interface BuilderProps {
  apiVersion: string;
  canTrack?: boolean;
  trustedHosts?: undefined;
  apiKey: string;
  model: string;
  content: any;
  data?: any;
  apiHost?: string;
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

  customComponents: RegisteredComponent[] = [
    {
      component: HelloComponent,
      name: 'Hello',
      inputs: [],
      defaultChildren: [
        {
          '@type': '@builder.io/sdk:Element',
          '@version': 2,
          id: 'builder-ebca7d55d34f4fc9a6536600959cef5d',
          component: {
            name: 'Text',
            options: {
              text: 'inside an h1',
            },
          },
        },
      ],
    },
    {
      name: 'BuilderBlockWithClassName',
      component: BuilderBlockWithClassNameComponent,
      shouldReceiveBuilderProps: {
        builderBlock: true,
        builderContext: true,
        builderComponents: true,
      },
      inputs: [
        {
          name: 'content',
          type: 'uiBlocks',
          defaultValue: [
            {
              '@type': '@builder.io/sdk:Element',
              '@version': 2,
              id: 'builder-c6e179528dee4e62b337cf3f85d6496f',
              component: {
                name: 'Text',
                options: {
                  text: 'Enter some text...',
                },
              },
              responsiveStyles: {
                large: {
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  flexShrink: '0',
                  boxSizing: 'border-box',
                  marginTop: '20px',
                  lineHeight: 'normal',
                  height: 'auto',
                },
              },
            },
          ],
        },
      ],
    },
  ];

  constructor(private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.activatedRoute.data.subscribe((data: any) => {
      this.content = data.content?.content;
      this.canTrack = data.content?.canTrack;
      this.trustedHosts = data.content?.trustedHosts;
      this.data = data.content?.data;
      this.apiHost = data.content?.apiHost;
    });
  }
}
