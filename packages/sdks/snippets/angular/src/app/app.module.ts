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
import { ProductDetailsComponent } from './product-details/product-details.component';
import { ProductEditorialComponent } from './product-editorial/product-editorial.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AnnouncementBarComponent,
    BlogArticleComponent,
    ProductEditorialComponent,
    ProductDetailsComponent,
    CatchAllComponent,
    RouterModule.forRoot([
      { path: 'announcements/:id', component: AnnouncementBarComponent },
      { path: 'blogs/new-product-line', component: BlogArticleComponent },
      { path: 'products/:id', component: ProductEditorialComponent },
      { path: 'product/category/jacket', component: ProductDetailsComponent },
      { path: '**', component: CatchAllComponent },
    ]),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
