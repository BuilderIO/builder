/**
 * Quickstart snippet
 * snippets/angular/src/app/app.module.ts
 */

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Content } from '@builder.io/sdk-angular';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  // add Content to imports
  imports: [Content, BrowserModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
