import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  Content,
  isPreviewing,
  type BuilderContent,
} from '@builder.io/sdk-angular';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [Content, CommonModule],
  template: `
    <builder-content
      *ngIf="canShowContent; else notFound"
      [model]="model"
      [content]="content"
      [apiKey]="apiKey"
    ></builder-content>
    <ng-template #notFound> 404 </ng-template>
  `,
})
export class HomepageComponent implements OnInit {
  content: BuilderContent | null = null;
  model = 'homepage';
  apiKey = 'ee9f13b4981e489a9a1209887695ef2b';
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
