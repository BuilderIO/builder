import { Component } from '@angular/core';
// fails because type imports cannot be injected
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { ActivatedRoute } from '@angular/router';
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

  customComponents = [
    {
      component: HelloComponent,
      name: 'Hello',
      inputs: [],
    },
  ];

  constructor(private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.activatedRoute.data.subscribe((data: any) => {
      this.content = data.content?.content;
      this.canTrack = data.content?.canTrack;
      this.trustedHosts = data.content?.trustedHosts;
      this.data = data.content?.data;
    });
  }
}
