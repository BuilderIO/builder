/**
 * Quickstart snippet
 * snippets/angular/src/app/app.module.ts
 */

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AnnouncementBarComponent } from './announcement-bar/announcement-bar.component';
import { AppComponent } from './app.component';
import { BlogArticleComponent } from './blog-article/blog-article.component';
import { CatchAllComponent } from './catch-all/catch-all.component';
import { ProductEditorialComponent } from './product-editorial/product-editorial.component';

@NgModule({
  declarations: [AppComponent],
  // add Content to imports
  imports: [
    BrowserModule,
    BlogArticleComponent,
    ProductEditorialComponent,
    AnnouncementBarComponent,
    CatchAllComponent,
    RouterModule.forRoot([
      { path: 'announcements/:id', component: AnnouncementBarComponent },
      { path: 'blogs/new-product-line', component: BlogArticleComponent },
      { path: 'products/:id', component: ProductEditorialComponent },
      { path: '**', component: CatchAllComponent },
    ]),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
