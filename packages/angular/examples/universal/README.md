# Angular Universal Starter

![Angular Universal](https://angular.io/generated/images/marketing/concept-icons/universal.png)

A minimal Angular starter for Universal JavaScript using the [Angular CLI](https://github.com/angular/angular-cli)
If you're looking for the Angular Universal repo go to [**angular/universal**](https://github.com/angular/universal)  

## Getting Started

This demo is built following the [Angular CLI Wiki guide](https://github.com/angular/angular-cli/wiki/stories-universal-rendering)

We're utilizing packages from the [Angular Universal @nguniversal](https://github.com/angular/universal) repo, such as [ng-module-map-ngfactory-loader](https://github.com/angular/universal/modules/module-map-ngfactory-loader) to enable Lazy Loading.

---

### Build Time Pre-rendering vs. Server-side Rendering (SSR)
This repo demonstrates the use of 2 different forms of Server-side Rendering.

**Pre-render** 
* Happens at build time
* Renders your application and replaces the dist index.html with a version rendered at the route `/`.

**Server-side Rendering (SSR)**
* Happens at runtime
* Uses `ngExpressEngine` to render your application on the fly at the requested url.

---

### Installation
* `npm install` or `yarn`

### Development (Client-side only rendering)
* run `npm run start` which will start `ng serve`

### Production (also for testing SSR/Pre-rendering locally)
**`npm run build:ssr && npm run serve:ssr`** - Compiles your application and spins up a Node Express to serve your Universal application on `http://localhost:4000`.

**`npm run build:prerender && npm run serve:prerender`** - Compiles your application and prerenders your applications files, spinning up a demo http-server so you can view it on `http://localhost:8080`
**Note**: To deploy your static site to a static hosting platform you will have to deploy the `dist/browser` folder, rather than the usual `dist`


## Universal "Gotchas"
Moved to [/angular/universal/blob/master/docs/gotchas.md](https://github.com/angular/universal/blob/master/docs/gotchas.md)

# License
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat)](/LICENSE)
