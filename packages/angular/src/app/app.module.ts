import { BrowserModule, BrowserTransferStateModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { BuilderModule } from './modules/builder/builder.module';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { BuilderService } from './modules/builder/services/builder.service';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    BuilderModule.forRoot('VQ7kLiTnpLQvaokXJSed'),
    AppRoutingModule,
    BrowserTransferStateModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(builder: BuilderService) {
    builder.setUserAttributes({
      locale: 'us',
      userIsLoggedIn: false,
    });
  }
}
