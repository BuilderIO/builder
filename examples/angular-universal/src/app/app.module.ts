import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BuilderModule } from '@builder.io/angular';

import { AppComponent, CustomThing } from './app.component';
import { FooComponent } from './foo.component';

@NgModule({
  declarations: [AppComponent, FooComponent, CustomThing],
  entryComponents: [CustomThing],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    BuilderModule.forRoot('db4da7332ae64a96b056ed574578485a'),
    RouterModule.forRoot([
      {
        path: '**',
        component: FooComponent,
      },
    ]),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
