/**
 * https://www.builder.io/c/docs/integrate-section-building
 * https://www.builder.io/c/blueprints/announcement-bar
 * src/app/announcement-bar/announcement-bar.component.ts
 */

import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { type BuilderContent } from '@builder.io/sdk-angular';

@Component({
  selector: 'app-announcement-bar',
  template: `
    <ng-container *ngIf="content">
      <content [model]="model" [content]="content" [apiKey]="apiKey"></content>
    </ng-container>

    <!-- Your content coming from your app (or also Builder) -->
    <div>The rest of your page goes here</div>
  `,
})
export class AnnouncementBarComponent {
  apiKey = 'ee9f13b4981e489a9a1209887695ef2b';
  model = 'announcement-bar';
  content: BuilderContent | null = null;

  constructor(private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.activatedRoute.data.subscribe((data: any) => {
      this.content = data.content;
    });
  }
}
