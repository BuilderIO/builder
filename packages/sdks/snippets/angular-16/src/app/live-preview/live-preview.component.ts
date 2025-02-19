import { CommonModule } from '@angular/common';
import type { OnDestroy, OnInit } from '@angular/core';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import type { BuilderContent } from '@builder.io/sdk-angular';
import { fetchOneEntry, subscribeToEditor } from '@builder.io/sdk-angular';

@Component({
  standalone: true,
  selector: 'app-live-preview',
  imports: [CommonModule],
  template: `
    <div *ngIf="loading" class="loading-message">Loading Data...</div>

    <div *ngIf="!loading && content" class="blog-data-preview">
      <div>Blog Title: {{ content.data?.title }}</div>
      <div>Authored by: {{ content.data?.['author'] }}</div>
      <div>Handle: {{ content.data?.['handle'] }}</div>
      <div>
        Published date:
        {{ getFormattedDate(content.data?.['publishedDate']) }}
      </div>
    </div>

    <div *ngIf="!loading && !content" class="no-data-message">No Data.</div>
  `,
})
export class LivePreviewComponent implements OnInit, OnDestroy {
  content: BuilderContent | null = null;
  loading = false;

  private unsubscribeFn?: () => void;
  private router = inject(Router);

  getFormattedDate(dateString: string | null): string {
    return dateString ? new Date(dateString).toDateString() : '';
  }

  ngOnInit(): void {
    this.loading = true;
    fetchOneEntry({
      model: 'blog-data',
      apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
      userAttributes: { urlPath: this.router.url },
    })
      .then((data) => {
        this.content = data || null;
      })
      .finally(() => {
        this.loading = false;
      });

    this.unsubscribeFn = subscribeToEditor({
      model: 'blog-data',
      apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
      callback: (updatedContent) => {
        this.content = updatedContent;
      },
    });
  }

  ngOnDestroy(): void {
    if (this.unsubscribeFn) {
      this.unsubscribeFn();
    }
  }
}
