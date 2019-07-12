import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { BuilderModule } from "@builder.io/angular";

import { AppComponent } from "./app.component";
import { FooComponent } from "./foo.component";

@NgModule({
  declarations: [AppComponent, FooComponent],
  imports: [
    BrowserModule,
    BuilderModule.forRoot("YJIGb4i01jvw0SRdL5Bt"),
    RouterModule.forRoot([
      {
        path: "**",
        component: FooComponent
      }
    ])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
