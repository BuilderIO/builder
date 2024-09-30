import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Blocks, Content } from '@builder.io/sdk-angular';
import { AppComponent } from './app.component';
import { BuilderBlockWithClassNameComponent } from './builder-block-with-class-name.component';

@NgModule({
  declarations: [AppComponent, BuilderBlockWithClassNameComponent],
  imports: [Blocks, Content, BrowserModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
