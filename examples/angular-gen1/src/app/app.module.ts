import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BuilderModule } from '@builder.io/angular';

import { AppComponent, CustomThing } from './app.component';
import { FooComponent } from './foo.component';
import { CustomThingChildren } from './with-children';
@NgModule({
  declarations: [AppComponent, FooComponent, CustomThing, CustomThingChildren],
  imports: [
    BrowserModule,
    BuilderModule.forRoot('1f3bf1d766354f32ba70dde440fcef97'),
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
