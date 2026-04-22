import { CommonModule } from '@angular/common';
import { Component, type OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  Content,
  isPreviewing,
  type BuilderContent,
} from '@builder.io/sdk-angular';
import { customHeroInfo } from './custom-hero/custom-hero.component';

@Component({
  selector: 'app-custom-child',
  standalone: true,
  imports: [Content, CommonModule],
  template: `
    <div *ngIf="canShowContent; else notFound">
      <builder-content
        [content]="content"
        [customComponents]="[customHeroInfo]"
      ></builder-content>
    </div>
    <ng-template #notFound> 404 </ng-template>
  `,
})
export class CustomChildComponent implements OnInit {
  content: BuilderContent | null = null;
  customHeroInfo = customHeroInfo;
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
