import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ShopstyleHomepageComponent } from './modules/shopstyle/components/shopstyle-homepage/shopstyle-homepage.component';
import { ShopstyleAboutPageComponent } from './modules/shopstyle/components/shopstyle-about-page/shopstyle-about-page.component';

const routes: Routes = [
  {
    path: '',
    component: ShopstyleHomepageComponent,
  },
  {
    path: 'home',
    component: ShopstyleHomepageComponent,
  },
  {
    path: 'about',
    component: ShopstyleAboutPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
