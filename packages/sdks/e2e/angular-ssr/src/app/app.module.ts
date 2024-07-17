import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Content } from '@builder.io/sdk-angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routing';
import { CatchAllComponent } from './catch-all.component';

@NgModule({
  declarations: [AppComponent, CatchAllComponent],
  imports: [Content, BrowserModule, AppRoutingModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
