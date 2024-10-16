/**
 * Quickstart snippet
 * snippets/angular-ssr/src/app/app.module.ts
 */

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AnnouncementBarComponent } from './announcement-bar/announcement-bar.component';
import { announcementBarResolver } from './announcement-bar/announcement-bar.resolver';
import { AppComponent } from './app.component';
import { BlogArticleComponent } from './blog-article/blog-article.component';
import { blogArticleResolver } from './blog-article/blog-article.resolver';
import { CatchAllComponent } from './catch-all/catch-all.component';
import { catchAllResolver } from './catch-all/catch-all.resolver';
import { ProductEditorialComponent } from './product-editorial/product-editorial.component';
import { productEditorialResolver } from './product-editorial/product-editorial.resolver';
import { productDetailsResolver } from './product-details/product-details.resolver';
import { ProductDetailsComponent } from './product-details/product-details.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AnnouncementBarComponent,
    CatchAllComponent,
    ProductEditorialComponent,
    RouterModule.forRoot([
      {
        path: 'announcements/:id',
        component: AnnouncementBarComponent,
        resolve: { content: announcementBarResolver },
      },
      {
        path: 'blogs/new-product-line',
        component: BlogArticleComponent,
        resolve: { article: blogArticleResolver },
      },
      {
        path: 'products/:id',
        component: ProductEditorialComponent,
        resolve: { productData: productEditorialResolver },
      },
      {
        path: 'product/category/:handle',
        component: ProductDetailsComponent,
        resolve: { productDetails: productDetailsResolver },
      },
      {
        path: '**',
        component: CatchAllComponent,
        resolve: { content: catchAllResolver },
      },
    ]),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
