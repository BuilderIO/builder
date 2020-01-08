import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { BuilderModule } from '@builder.io/angular';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { PrebootModule } from 'preboot';

@NgModule({
  declarations: [AppComponent, HomeComponent],
  imports: [
    BrowserModule.withServerTransition({ appId: 'my-app' }),
    PrebootModule.withConfig({ appRoot: 'app-root' }),
    BuilderModule.forRoot('2bdcbde0dfc34ac4bd6385f29b564fcc'),
    RouterModule.forRoot([{ path: '**', component: HomeComponent }], {
      initialNavigation: 'enabled',
    }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
