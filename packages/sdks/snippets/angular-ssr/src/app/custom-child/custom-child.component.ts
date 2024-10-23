import { CommonModule } from '@angular/common';
import { Component, type OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  Content,
  type BuilderContent,
} from '@builder.io/sdk-angular';
import { customHeroInfo } from './custom-hero/custom-hero.component';

@Component({
  selector: 'app-custom-child',
  standalone: true,
  imports: [Content, CommonModule],
  template: `
    <div *ngIf="content">
      <builder-content
        [content]="content"
        [model]="model"
        [apiKey]="apiKey"
        [customComponents]="[customHeroInfo]"
      ></builder-content>
    </div>

    <div *ngIf="notFound">404 Not Found</div>
  `,
})
export class CustomChildComponent implements OnInit {
  notFound = false;
  content: BuilderContent | null = null;
  customHeroInfo = customHeroInfo;
  model = 'page';
  apiKey = 'ee9f13b4981e489a9a1209887695ef2b';

  constructor(private route: ActivatedRoute) {}

  async ngOnInit() {
    this.route.data.subscribe((data: any) => (this.content = data.content));
  }
}
