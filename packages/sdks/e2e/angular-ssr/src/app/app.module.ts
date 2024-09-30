import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Blocks, Content } from '@builder.io/sdk-angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routing';
import { BuilderBlockWithClassNameComponent } from './builder-block-with-class-name.component';
import { CatchAllComponent } from './catch-all.component';

@NgModule({
  declarations: [
    AppComponent,
    CatchAllComponent,
    BuilderBlockWithClassNameComponent,
  ],
  imports: [Blocks, Content, BrowserModule, AppRoutingModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
