import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NotFoundComponent } from './not-found.component';
import { BuilderModule } from '@builder.io/angular';
import { Builder } from '@builder.io/sdk';

Builder.isStatic = true;

@NgModule({
  declarations: [AppComponent, NotFoundComponent],
  imports: [
    BrowserModule.withServerTransition({ appId: 'ng-app' }),
    AppRoutingModule,
    BuilderModule.forRoot('db4da7332ae64a96b056ed574578485a'),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
