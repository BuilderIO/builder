import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { TransferHttpCacheModule } from '@nguniversal/common';

import { BuilderModule } from '@builder.io/angular';

@NgModule({
  declarations: [AppComponent, HomeComponent],
  imports: [
    BrowserModule.withServerTransition({ appId: 'my-app' }),
    BuilderModule.forRoot('2bdcbde0dfc34ac4bd6385f29b564fcc'),
    RouterModule.forRoot([{ path: '**', component: HomeComponent }]),
    TransferHttpCacheModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(private router?: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        console.log('event', event);
      }
    });
  }
}
