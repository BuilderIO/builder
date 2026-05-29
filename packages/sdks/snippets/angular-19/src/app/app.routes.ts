import type { Routes } from '@angular/router';
import { AdvancedChildComponent } from './advanced-child/advanced-child.component';
import { AnnouncementBarComponent } from './announcement-bar/announcement-bar.component';
import { BlogArticleComponent } from './blog-article/blog-article.component';
import { CatchAllComponent } from './catch-all/catch-all.component';
import { CustomChildComponent } from './custom-child/custom-child.component';
import { EditableRegionComponent } from './editable-regions/editable-regions.component';
import { HeroComponent } from './hero/hero.component';
import { HomepageComponent } from './home/homepage.component';
import { LivePreviewComponent } from './live-preview/live-preview.component';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { ProductEditorialComponent } from './product-editorial/product-editorial.component';

export const routes: Routes = [
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
  { path: 'marketing-event', component: HeroComponent },
  { path: 'home', component: HomepageComponent },
  { path: '**', component: CatchAllComponent },
];
