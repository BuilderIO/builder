/**
 * Quickstart snippet
 * snippets/angular-16-ssr/src/app/app.module.ts
 */

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { advancedChildResolver } from './advanced-child/advanced-child-resolver';
import { AdvancedChildComponent } from './advanced-child/advanced-child.component';
import { AnnouncementBarComponent } from './announcement-bar/announcement-bar.component';
import { announcementBarResolver } from './announcement-bar/announcement-bar.resolver';
import { AppComponent } from './app.component';
import { BlogArticleComponent } from './blog-article/blog-article.component';
import { blogArticleResolver } from './blog-article/blog-article.resolver';
import { CatchAllComponent } from './catch-all/catch-all.component';
import { catchAllResolver } from './catch-all/catch-all.resolver';
import { CustomChildComponent } from './custom-child/custom-child.component';
import { customChildResolver } from './custom-child/custom-child.resolver';
import { editableRegionsResolver } from './editable-regions/editable-regions-resolver';
import { EditableRegionComponent } from './editable-regions/editable-regions.component';
import { LivePreviewComponent } from './live-preview/live-preview.component';
import { livePreviewResolver } from './live-preview/live-preview.resolver';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { navBarResolver } from './nav-bar/nav-bar.resolver';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { productDetailsResolver } from './product-details/product-details.resolver';
import { ProductEditorialComponent } from './product-editorial/product-editorial.component';
import { productEditorialResolver } from './product-editorial/product-editorial.resolver';

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
        path: 'landing-page',
        component: NavBarComponent,
        resolve: { navLinks: navBarResolver },
      },
      {
        path: 'custom-child',
        component: CustomChildComponent,
        resolve: { content: customChildResolver },
      },
      {
        path: 'editable-region',
        component: EditableRegionComponent,
        resolve: { content: editableRegionsResolver },
      },
      {
        path: 'advanced-child',
        component: AdvancedChildComponent,
        resolve: { content: advancedChildResolver },
      },
      {
        path: 'live-preview',
        component: LivePreviewComponent,
        resolve: { content: livePreviewResolver },
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
