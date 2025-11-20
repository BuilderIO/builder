import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";

@Component({
  selector: "app-home-page",
  standalone: true,
  imports: [RouterLink],
  template: `
    <a routerLink="/en/builder-repeat">Follow me (CSR)</a>
  `,
})
export class HomePage {

}
