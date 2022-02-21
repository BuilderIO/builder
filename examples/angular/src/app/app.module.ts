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
    BrowserModule,
    BuilderModule.forRoot('afa4910e04ea4d5b948075edbbfc5d80'),
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
