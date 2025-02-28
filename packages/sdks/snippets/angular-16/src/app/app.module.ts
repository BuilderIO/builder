/**
 * Quickstart snippet
 * snippets/angular/src/app/app.module.ts
 */

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AdvancedChildComponent } from './advanced-child/advanced-child.component';
import { CustomTabsComponent } from './advanced-child/custom-tabs/custom-tabs.component';
import { AnnouncementBarComponent } from './announcement-bar/announcement-bar.component';
import { AppComponent } from './app.component';
import { BlogArticleComponent } from './blog-article/blog-article.component';
import { CatchAllComponent } from './catch-all/catch-all.component';
import { CustomChildComponent } from './custom-child/custom-child.component';
import { CustomHeroComponent } from './custom-child/custom-hero/custom-hero.component';
import { CustomColumnsComponent } from './editable-regions/custom-columns/custom-columns.component';
import { EditableRegionComponent } from './editable-regions/editable-regions.component';
import { LivePreviewComponent } from './live-preview/live-preview.component';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { ProductEditorialComponent } from './product-editorial/product-editorial.component';
@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    RouterModule,
    AnnouncementBarComponent,
    BlogArticleComponent,
    ProductEditorialComponent,
    ProductDetailsComponent,
    AnnouncementBarComponent,
    NavBarComponent,
    CustomChildComponent,
    CustomHeroComponent,
    CustomColumnsComponent,
    EditableRegionComponent,
    AdvancedChildComponent,
    CustomTabsComponent,
    LivePreviewComponent,
    CatchAllComponent,
    RouterModule.forRoot([
      { path: 'announcements/:id', component: AnnouncementBarComponent },
      { path: 'blogs/new-product-line', component: BlogArticleComponent },
      { path: 'products/:id', component: ProductEditorialComponent },
      { path: 'product/category/jacket', component: ProductDetailsComponent },
      { path: 'landing-page', component: NavBarComponent },
      {
        path: 'custom-child',
        component: CustomChildComponent,
      },
      {
        path: 'editable-region',
        component: EditableRegionComponent,
      },
      { path: 'advanced-child', component: AdvancedChildComponent },
      { path: 'live-preview', component: LivePreviewComponent },
      { path: '**', component: CatchAllComponent },
    ]),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
