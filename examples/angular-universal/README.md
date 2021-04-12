# Builder.io Angular Universal example

Cloned from [https://github.com/enten/angular-universal](https://github.com/enten/angular-universal).
This is an example of using Builder.io for dynamic page building with Angular and Angular Universal for server side rendering.

See the full Angular SDK source code and docs over [here](/packages/angular)

## Running locally

This starter kit is **universal 100% which means you developing for both browser and server at the same time**.

- `ng build` - Building bundles for both browser and server platforms in [same compilation][webpack-multicompiler-example] ;
- `ng serve` - Running universal dev server with [Hot Module Replacement (HMR)][webpack-concept-hmr] enabled on browser and server sides ;
- `ng serve -c spa` - Running universal dev server with Server Side Rendering (SSR) disabled for angular routes only.

In other words, this starter kit gives superpower for those who want develop universal application fastly with no pain. Just keep in mind with great power comes [great responsibility (Universal Gotcha's)][universal-gotchas].

## Development server

Run `ng serve` to start universal dev server. Navigate to [http://localhost:4000/](http://localhost:4000/).

The app will automatically hot-reload on server and browser sides if you change any of the source files.

The full compilation will automatically restart if a hot chunk can't be applied on server side.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/app` directory.

Run `ng build --prod` for a production build.

Run `node dist/app/server/main.js` to start application built.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

[angulario-ssr]: https://angular.io/guide/universal
[angular-cli]: https://github.com/angular/angular-cli
[universal-gotchas]: https://github.com/angular/universal/blob/master/docs/gotchas.md
[webpack-concept-hmr]: https://webpack.js.org/concepts/hot-module-replacement/
[webpack-multicompiler-example]: https://github.com/webpack/webpack/tree/master/examples/multi-compiler
