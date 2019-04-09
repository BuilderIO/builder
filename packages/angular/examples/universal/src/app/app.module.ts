import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";

import { AppComponent } from "./app.component";
import { HomeComponent } from "./home/home.component";
import { TransferHttpCacheModule } from "@nguniversal/common";

import { BuilderModule } from "@builder.io/angular";

@NgModule({
  declarations: [AppComponent, HomeComponent],
  imports: [
    BrowserModule.withServerTransition({ appId: "my-app" }),
    BuilderModule.forRoot("YJIGb4i01jvw0SRdL5Bt"),
    RouterModule.forRoot([
      { path: "", component: HomeComponent, pathMatch: "full" },
      { path: "lazy", loadChildren: "./lazy/lazy.module#LazyModule" },
      { path: "lazy/nested", loadChildren: "./lazy/lazy.module#LazyModule" }
    ]),
    TransferHttpCacheModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
