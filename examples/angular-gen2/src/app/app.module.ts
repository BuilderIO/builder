import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AdvancedChildComponent } from '../../../../packages/sdks/snippets/angular-16/src/app/advanced-child/advanced-child.component';
import { CustomTabsComponent } from '../../../../packages/sdks/snippets/angular-16/src/app/advanced-child/custom-tabs/custom-tabs.component';
import { AnnouncementBarComponent } from '../../../../packages/sdks/snippets/angular-16/src/app/announcement-bar/announcement-bar.component';
import { AppComponent } from './app.component';
import { BlogArticleComponent } from '../../../../packages/sdks/snippets/angular-16/src/app/blog-article/blog-article.component';
import { CatchAllComponent } from '../../../../packages/sdks/snippets/angular-16/src/app/catch-all/catch-all.component';
import { CustomChildComponent } from '../../../../packages/sdks/snippets/angular-16/src/app/custom-child/custom-child.component';
import { CustomHeroComponent } from '../../../../packages/sdks/snippets/angular-16/src/app/custom-child/custom-hero/custom-hero.component';
import { CustomColumnsComponent } from '../../../../packages/sdks/snippets/angular-16/src/app/editable-regions/custom-columns/custom-columns.component';
import { EditableRegionComponent } from '../../../../packages/sdks/snippets/angular-16/src/app/editable-regions/editable-regions.component';
import { NavBarComponent } from '../../../../packages/sdks/snippets/angular-16/src/app/nav-bar/nav-bar.component';
import { ProductDetailsComponent } from '../../../../packages/sdks/snippets/angular-16/src/app/product-details/product-details.component';
import { ProductEditorialComponent } from '../../../../packages/sdks/snippets/angular-16/src/app/product-editorial/product-editorial.component';

@NgModule({
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
      { path: '**', component: CatchAllComponent },
    ]),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
