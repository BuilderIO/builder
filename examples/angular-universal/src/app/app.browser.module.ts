import { NgModule } from '@angular/core';
import { BrowserTransferStateModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { AppModule } from './app.module';

@NgModule({
  imports: [
    AppModule,
    // Needed for builder.io to hydrate server rendered content
    BrowserTransferStateModule,
  ],
  bootstrap: [AppComponent],
})
export class AppBrowserModule {}
