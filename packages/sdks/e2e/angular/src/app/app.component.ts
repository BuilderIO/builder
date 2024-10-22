import { Component } from '@angular/core';
import {
  _processContentResult,
  fetchOneEntry,
  getBuilderSearchParams,
  type RegisteredComponent,
} from '@builder.io/sdk-angular';
import { getProps } from '@sdk/tests';
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
}

@Component({
  selector: 'app-root',
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
      ></builder-content>
    </ng-container>

    <ng-template #notFound>
      <div>404 - Content not found</div>
    </ng-template>
  `,
})
export class AppComponent {
  title = 'angular';
  apiVersion: BuilderProps['apiVersion'] = 'v3';
  canTrack: BuilderProps['canTrack'];
  trustedHosts: BuilderProps['trustedHosts'];
  apiKey: BuilderProps['apiKey'] = 'abcd';
  model: BuilderProps['model'] = 'page';
  content: BuilderProps['content'];
  data: BuilderProps['data'];

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

  async ngOnInit() {
    const urlPath = window.location.pathname || '';

    const builderProps = await getProps({
      pathname: urlPath,
      _processContentResult,
      options: getBuilderSearchParams(
        new URLSearchParams(window.location.search)
      ),
      fetchOneEntry,
    });

    if (!builderProps) {
      return;
    }

    this.content = builderProps.content;
    this.canTrack = builderProps.canTrack;
    this.trustedHosts = builderProps.trustedHosts;
    this.apiKey = builderProps.apiKey;
    this.model = builderProps.model;
    this.apiVersion = builderProps.apiVersion;
    this.data = builderProps.data;
  }
}
