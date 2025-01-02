import { CommonModule } from '@angular/common';
import { Component, type OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Content, type BuilderContent } from '@builder.io/sdk-angular';
import {
  CustomTabsComponent,
  customTabsInfo,
} from './custom-tabs/custom-tabs.component';

@Component({
  selector: 'app-advanced-child',
  standalone: true,
  imports: [CommonModule, Content, CustomTabsComponent],
  template: `
    <div *ngIf="content">
      <builder-content
        [content]="content"
        [model]="modelName"
        [apiKey]="apiKey"
        [customComponents]="customComponents"
      />
    </div>
    <div *ngIf="notFound">404</div>
  `,
})
export class AdvancedChildComponent implements OnInit {
  apiKey = 'ee9f13b4981e489a9a1209887695ef2b';
  modelName = 'page';

  content: BuilderContent | null = null;
  notFound = false;
  customComponents = [customTabsInfo];

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.data.subscribe((data: any) => {
      this.content = data.content;
    });
  }
}
