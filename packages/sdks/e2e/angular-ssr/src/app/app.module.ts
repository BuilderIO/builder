import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Content } from '@builder.io/sdk-angular';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [Content, BrowserModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
