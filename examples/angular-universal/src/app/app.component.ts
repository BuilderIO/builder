import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-container">
      <h1>Angular Universal Demo utilizing Angular & Angular CLI</h1>
      <nav class="nav-links">
        <a routerLink="/">Home</a>
        <a routerLink="/pages/aboutus">About</a>
        <a routerLink="/pages/sizechart">Size chart</a>
      </nav>
      <div class="router-container">
        <router-outlet></router-outlet>
      </div>
      <builder-component model="page"></builder-component>
    </div>
  `,
  styles: [
    `
      :host {
        background: #f1f1f1;
        font-family: Roboto, 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial,
          'Lucida Grande', sans-serif;
        font-display: swap;
      }
      .nav-links {
        background: #008591;
      }
      .nav-links a {
        color: #fff;
        display: inline-block;
        padding: 1rem;
        margin-right: 3rem;
        text-decoration: none;
        font-weight: bold;
        letter-spacing: 0.1rem;
      }
      .router-container {
        border: 0.5rem #00afc4 solid;
        padding: 2rem;
      }
    `,
  ],
})
// TODO: show updating meta info based on returned content
export class AppComponent {}
