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
  template: `<div *ngIf="loading">Loading Data...</div>
    <div *ngIf="!loading && content" class="blog-data-preview">
      <div>Blog Title: {{ content.data?.title }}</div>
      <div>Authored by: {{ content.data?.['author'] }}</div>
      <div>Handle: {{ content.data?.['handle'] }}</div>
      <div>
        Published date:
        {{
          content.data?.['publishedDate']?.split(' ')?.slice(0, 4)?.join(' ')
        }}
      </div>
    </div>
    <div *ngIf="error" class="error-message">{{ error }}</div>`,
})
export class LivePreviewComponent implements OnInit, OnDestroy {
  content: BuilderContent | null = null;
  loading = true;
  error: string | null = null;

  private unsubscribeFn?: () => void;
  private router = inject(Router);

  ngOnInit(): void {
    fetchOneEntry({
      model: 'blog-data',
      apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
      userAttributes: {
        urlPath: this.router.url,
      },
    })
      .then((data) => {
        this.content = data;
        this.loading = false;
      })
      .catch((err) => {
        console.error(
          'Something went wrong while fetching Builder content:',
          err
        );
        this.error = 'Failed to load content. Please try again later.';
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
