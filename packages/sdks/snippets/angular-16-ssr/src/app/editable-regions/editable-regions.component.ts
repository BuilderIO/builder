import { CommonModule } from '@angular/common';
import { Component, type OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  Content,
  isPreviewing,
  type BuilderContent,
} from '@builder.io/sdk-angular';
import { customColumnsInfo } from './custom-columns/custom-columns.component';

@Component({
  selector: 'app-editable-region',
  standalone: true,
  imports: [CommonModule, Content],
  template: `
    <div *ngIf="canShowContent; else notFound">
      <builder-content
        [content]="content"
        [model]="model"
        [apiKey]="apiKey"
        [customComponents]="customComponents"
      />
    </div>
    <ng-template #notFound>404</ng-template>
  `,
})
export class EditableRegionComponent implements OnInit {
  model = 'page';
  apiKey = 'ee9f13b4981e489a9a1209887695ef2b';
  customComponents = [customColumnsInfo];
  content: BuilderContent | null = null;
  canShowContent = false;

  constructor(private route: ActivatedRoute) {}

  async ngOnInit() {
    this.route.data.subscribe((data: any) => {
      this.content = data.content;
      const searchParams = this.route.snapshot.queryParams;
      this.canShowContent = !!this.content || isPreviewing(searchParams);
    });
  }
}
