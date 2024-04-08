import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { ContentVariantsComponent } from '@builder.io/sdk-angular';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [ContentVariantsComponent, BrowserModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
