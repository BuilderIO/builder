import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  Content,
  fetchOneEntry,
  type BuilderContent,
} from '@builder.io/sdk-angular';

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
export class HomepageComponent {
  content: BuilderContent | null = null;

  async ngOnInit() {
    this.content = await fetchOneEntry({
      model: 'homepage',
      apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
    });
  }
}
