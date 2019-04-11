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
    BuilderModule.forRoot("8ad6fc88243f4ec3ab78ec0540df7954"),
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
