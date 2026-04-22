import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  Content,
  isPreviewing,
  type BuilderContent,
} from '@builder.io/sdk-angular';

@Component({
  selector: 'app-blog-article',
  standalone: true,
  imports: [Content, CommonModule],
  template: `<div *ngIf="canShowContent" class="content" else notFound>
      <h1>{{ article?.data?.title }}</h1>
      <p>{{ article?.data?.['blurb'] }}</p>
      <img [src]="article?.data?.['image']" alt="" />
      <builder-content
        [model]="model"
        [content]="article"
        [apiKey]="apiKey"
      ></builder-content>
    </div>
    <ng-template #notFound> 404 </ng-template>`,
})
export class BlogArticleComponent {
  article: BuilderContent | null = null;
  model = 'blog-article';
  apiKey = 'ee9f13b4981e489a9a1209887695ef2b';
  canShowContent = false;

  constructor(private route: ActivatedRoute) {}
  async ngOnInit() {
    this.route.data.subscribe((data) => {
      this.article = data['article'];
      const searchParams = this.route.snapshot.queryParams;
      this.canShowContent = !!this.article || isPreviewing(searchParams);
    });
  }
}
