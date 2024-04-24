// fails because type imports cannot be injected
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { Component, ChangeDetectorRef } from '@angular/core';
import {
  _processContentResult,
  fetchOneEntry,
  getBuilderSearchParams,
} from '@builder.io/sdk-angular';
import { getProps } from '@e2e/tests';

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

  constructor(private cdr: ChangeDetectorRef) {}

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

    this.cdr.detectChanges();
  }
}
