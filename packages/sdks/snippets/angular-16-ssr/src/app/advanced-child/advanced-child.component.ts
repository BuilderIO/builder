import { CommonModule } from '@angular/common';
import { Component, type OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  Content,
  isPreviewing,
  type BuilderContent,
} from '@builder.io/sdk-angular';
import {
  CustomTabsComponent,
  customTabsInfo,
} from './custom-tabs/custom-tabs.component';

@Component({
  selector: 'app-advanced-child',
  standalone: true,
  imports: [CommonModule, Content, CustomTabsComponent],
  template: `
    <div *ngIf="canShowContent; else notFound">
      <builder-content
        [content]="content"
        [model]="modelName"
        [apiKey]="apiKey"
        [customComponents]="customComponents"
      />
    </div>
    <ng-template #notFound> 404 </ng-template>
  `,
})
export class AdvancedChildComponent implements OnInit {
  apiKey = 'ee9f13b4981e489a9a1209887695ef2b';
  modelName = 'page';

  content: BuilderContent | null = null;
  canShowContent = false;
  customComponents = [customTabsInfo];

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.data.subscribe((data: any) => {
      this.content = data.content;
      const searchParams = this.route.snapshot.queryParams;
      this.canShowContent = !!this.content || isPreviewing(searchParams);
    });
  }
}
