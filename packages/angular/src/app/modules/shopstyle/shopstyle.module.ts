import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { BuilderModule } from './../builder/builder.module';
import { ShopstyleHomepageComponent } from './components/shopstyle-homepage/shopstyle-homepage.component';
import { ShopstyleHeaderComponent } from './components/shopstyle-header/shopstyle-header.component';
import { ShopstyleHeroComponent } from './components/shopstyle-hero/shopstyle-hero.component';
import { ShopstyleHeadingComponent } from './components/shopstyle-heading/shopstyle-heading.component';
import { ShopstyleAboutPageComponent } from './components/shopstyle-about-page/shopstyle-about-page.component';
import { ShopstyleProductCellComponent } from './components/shopstyle-product-cell/shopstyle-product-cell.component';
import { ShopstyleProductsListComponent } from './components/shopstyle-products-list/shopstyle-products-list.component';
import { ShopstyleFeaturedImageComponent } from './components/shopstyle-featured-image/shopstyle-featured-image.component';

@NgModule({
  imports: [CommonModule, BuilderModule, HttpClientModule],
  declarations: [
    ShopstyleHomepageComponent,
    ShopstyleHeaderComponent,
    ShopstyleHeroComponent,
    ShopstyleHeadingComponent,
    ShopstyleAboutPageComponent,
    ShopstyleProductCellComponent,
    ShopstyleProductsListComponent,
    ShopstyleFeaturedImageComponent,
  ],
  exports: [ShopstyleHomepageComponent, ShopstyleHeaderComponent],
  entryComponents: [
    ShopstyleHeadingComponent,
    ShopstyleProductCellComponent,
    ShopstyleProductsListComponent,
    ShopstyleFeaturedImageComponent,
  ],
})
export class ShopstyleModule {}
