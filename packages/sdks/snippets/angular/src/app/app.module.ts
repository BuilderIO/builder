/**
 * Quickstart snippet
 * snippets/angular/src/app/app.module.ts
 */

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { Content } from '@builder.io/sdk-angular';
import { AnnouncementBarComponent } from './announcement-bar/announcement-bar.component';
import { AppComponent } from './app.component';
import { CatchAllComponent } from './catch-all/catch-all.component';

@NgModule({
  declarations: [AppComponent, AnnouncementBarComponent, CatchAllComponent],
  // add Content to imports
  imports: [
    BrowserModule,
    Content,
    RouterModule.forRoot([
      { path: 'announcements/:id', component: AnnouncementBarComponent },
      { path: '**', component: CatchAllComponent },
    ]),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
