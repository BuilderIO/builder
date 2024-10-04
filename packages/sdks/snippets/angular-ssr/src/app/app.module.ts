/**
 * Quickstart snippet
 * snippets/angular-ssr/src/app/app.module.ts
 */

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { Content } from '@builder.io/sdk-angular';
import { AnnouncementBarComponent } from './announcement-bar/announcement-bar.component';
import { announcementBarResolver } from './announcement-bar/announcement-bar.resolver';
import { AppComponent } from './app.component';
import { BlogArticleComponent } from './blog-article/blog-article.component';
import { blogArticleResolver } from './blog-article/blog-article.resolver';
import { CatchAllComponent } from './catch-all/catch-all.component';
import { catchAllResolver } from './catch-all/catch-all.resolver';

@NgModule({
  declarations: [AppComponent, AnnouncementBarComponent, CatchAllComponent],
  // add Content to imports
  imports: [
    Content,
    BrowserModule,
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
