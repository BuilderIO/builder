import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Content, type BuilderContent } from '@builder.io/sdk-angular';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [Content, CommonModule],
  template: `
    <ng-container *ngIf="!content">404</ng-container>
    <builder-content
      *ngIf="content"
      [model]="'homepage'"
      [content]="content"
      [apiKey]="'ee9f13b4981e489a9a1209887695ef2b'"
    ></builder-content>
  `,
})
export class HomepageComponent implements OnInit {
  content: BuilderContent | null = null;

  constructor(private route: ActivatedRoute) {}

  async ngOnInit() {
    this.route.data.subscribe((data: any) => {
      this.content = data.content;
    });
  }
}
