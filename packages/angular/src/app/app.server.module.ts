import { NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';
import { ModuleMapLoaderModule } from '@nguniversal/module-map-ngfactory-loader';
import { ServerTransferStateModule } from '@angular/platform-server';

import { AppModule } from './app.module';
import { AppComponent } from './app.component';

@NgModule({
  imports: [AppModule, ServerModule, ModuleMapLoaderModule, ServerTransferStateModule],

  bootstrap: [AppComponent],
})
export class AppServerModule {}
