import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import type { BuilderContent } from '@builder.io/sdk-angular';
import { subscribeToEditor } from '@builder.io/sdk-angular';

@Component({
  standalone: true,
  selector: 'app-live-preview',
  imports: [CommonModule],
  template: `
    <div *ngIf="content" class="blog-data-preview">
      <div>Blog Title: {{ content.data?.title }}</div>
      <div>Authored by: {{ content.data?.['author'] }}</div>
      <div>Handle: {{ content.data?.['handle'] }}</div>
    </div>
  `,
})
export class LivePreviewComponent implements OnInit, OnDestroy {
  content: BuilderContent | null = null;

  private unsubscribeFn: () => void = () => {};

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.unsubscribeFn = subscribeToEditor({
        model: 'blog-data',
        apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
        callback: (updatedContent) => {
          this.content = updatedContent;
        },
      });
    }
  }

  ngOnDestroy(): void {
    this.unsubscribeFn();
  }
}
