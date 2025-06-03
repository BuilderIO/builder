/**
 * https://www.builder.io/c/docs/integrate-section-building
 * https://www.builder.io/c/blueprints/announcement-bar
 * src/app/announcement-bar/announcement-bar.component.ts
 */

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  Content,
  isPreviewing,
  type BuilderContent,
} from '@builder.io/sdk-angular';

@Component({
  selector: 'app-announcement-bar',
  standalone: true,
  imports: [Content, CommonModule],
  template: `
    <ng-container *ngIf="canShowContent; else notFound">
      <builder-content
        [model]="model"
        [content]="content"
        [apiKey]="apiKey"
      ></builder-content>
    </ng-container>
    <ng-template #notFound> 404 </ng-template>
  `,
})
export class AnnouncementBarComponent implements OnInit {
  apiKey = 'ee9f13b4981e489a9a1209887695ef2b';
  model = 'announcement-bar';
  content: BuilderContent | null = null;
  canShowContent = false;

  constructor(private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.activatedRoute.data.subscribe((data: any) => {
      this.content = data.content;
      const searchParams = this.activatedRoute.snapshot.queryParams;
      this.canShowContent = !!this.content || isPreviewing(searchParams);
    });
  }
}
