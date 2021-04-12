import { Component, Inject, Optional } from '@angular/core';
import { RESPONSE } from '@nguniversal/express-engine/tokens';
import { Builder } from '@builder.io/sdk';
import { Meta, Title } from '@angular/platform-browser';

interface PartialResponse {
  status(code: number): this;
}

@Component({
  selector: 'app-not-found',
  template: `
    <builder-component
      (load)="onContentLoad($event)"
      (error)="onContentError($event)"
      model="page"
    ></builder-component>
    <div *ngIf="showNotFound">page not found</div>
  `,
})
export class NotFoundComponent {
  showNotFound = false;
  constructor(
    @Optional() @Inject(RESPONSE) private response: PartialResponse,
    private title: Title,
    private meta: Meta
  ) {}

  onContentLoad(content?: any) {
    if (!content) {
      if (this.response) {
        this.response.status(404);
      }
      if (Builder.isBrowser && !Builder.isEditing && !Builder.isPreviewing) {
        this.showNotFound = true;
      }
    } else {
      const { title, description } = content.data;
      if (title) {
        this.title.setTitle(title);
        this.meta.addTag({ name: 'title', content: title });
      }
      if (description) {
        this.meta.addTag({ name: 'description', content: description });
      }
    }
  }
  onContentError(error: any) {
    console.error(error);
    if (this.response) {
      // maybe 500?
      this.response.status(404);
    }
  }
}
