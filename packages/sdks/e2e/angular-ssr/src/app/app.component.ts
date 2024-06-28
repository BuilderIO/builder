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
  _processContentResult,
  fetchOneEntry,
  getBuilderSearchParams,
} from '@builder.io/sdk-angular';
import { REQUEST } from '@nguniversal/express-engine/tokens';
import { getProps } from '@sdk/tests';
import { HelloComponent } from './hello.component';

interface BuilderProps {
  apiVersion: string;
  canTrack?: boolean;
  trustedHosts?: undefined;
  apiKey: string;
  model: string;
  content: any;
}

@Component({
  selector: 'app-root',
  template: `
    <content-variants
      [model]="model"
      [content]="content"
      [apiKey]="apiKey"
      [trustedHosts]="trustedHosts"
      [canTrack]="canTrack"
      [customComponents]="customComponents"
    ></content-variants>
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

  customComponents = [
    {
      component: HelloComponent,
      name: 'Hello',
      inputs: [],
    },
  ];

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
    getProps({
      pathname: urlPath,
      _processContentResult,
      options: searchParams ? getBuilderSearchParams(searchParams) : {},
      fetchOneEntry,
    }).then((builderProps) => {
      if (!builderProps) {
        return;
      }
      this.content = builderProps.content;
      this.canTrack = builderProps.canTrack;
      this.trustedHosts = builderProps.trustedHosts;
      this.apiKey = builderProps.apiKey;
      this.model = builderProps.model;
      this.apiVersion = builderProps.apiVersion;
    });
  }

  async ngOnInit() {
    this.cdr.detectChanges();
  }
}
