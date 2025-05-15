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
      *ngIf="content || isPreviewing(); else notFound"
      [model]="MODEL"
      [content]="content"
      [apiKey]="API_KEY"
    ></builder-content>
    <ng-template #notFound>
      <div>404</div>
    </ng-template>
  `,
})
export class HomepageComponent implements OnInit {
  content: BuilderContent | null = null;

  MODEL = 'homepage';
  API_KEY = 'ee9f13b4981e489a9a1209887695ef2b';

  isPreviewing = isPreviewing;
  constructor(private route: ActivatedRoute) {}

  async ngOnInit() {
    this.route.data.subscribe((data: any) => {
      this.content = data.content;
    });
  }
}
