import { outputFileAsync, readFileAsync } from 'fs-extra-promise';
const pkg = require('../package.json');

async function main() {
  const [sjs /*systemMain*/] = await Promise.all([
    readFileAsync('./node_modules/systemjs/dist/s.min.js', 'utf8'),
    // readFileAsync('./dist/system/builder-webcomponents.js', 'utf8')
  ]);
  // TODO: bootstrap script goes here... hmmm...
  // TODO: export basic builder stuff from here so people can use js, or System.import name it hmm
  const newFileStr = (useAngular = false) =>
    `(function () { if (typeof window !== 'undefined' && !window.builderWebcomponentsLoaded) {\n` +
    [
      'window.builderWebcomponentsLoaded = true;',
      // Don't load System.js multiple times...
      sjs,
      // TODO: get the version of this and load - how does the others do
      /*systemMain*/ `
      function getQueryParam(url, variable) {
        var query = url.split('?')[1] || '';
        var vars = query.split('&');
        for (var i = 0; i < vars.length; i++) {
          var pair = vars[i].split('=');
          if (decodeURIComponent(pair[0]) === variable) {
            return decodeURIComponent(pair[1]);
          }
        }
        return null;
      }
      var version = typeof location !== 'undefined' && location.href && getQueryParam(location.href, 'builder.wcVersion') ||  "${
        pkg.version
      }";

      var wcRootParam = typeof location !== 'undefined' && location.href && getQueryParam(location.href, 'builder.wcRoot');
      var root = wcRootParam === "dev" ? "http://localhost:1267" : "https://cdn.builder.io/js/webcomponents";
      /* TODO: make rollup es6 build and use WC es6 if browser supports */
      var useLiteQuery = getQueryParam(location.href, 'builder.useWcLite');
      var useLite = useLiteQuery ? JSON.parse(useLiteQuery) : 'customElements' in window;
      if (!window.builderWcLoadCallbacks) {
        window.builderWcLoadCallbacks = [];
      }
      if (!window.onBuilderWcLoad) {
        window.onBuilderWcLoad = function (cb) {
          if (window.BuilderWC) {
            cb(BuilderWC);
          } else {
            builderWcLoadCallbacks.push(cb);
          }
        };
      }
      System.import(root + (root.indexOf('://localhost:') === -1 ? '@' + version : '') + '/dist/system/${
        useAngular ? 'angular/' : ''
      }' + (useLite ? 'lite/' : '') + 'builder-webcomponents' + (useLite ? '-lite' : '') + '.js')
    `.replace(/\s+/g, ' '),
    ].join(';') +
    `}})()`;

  // May need to import to initialize: + ';System.import("...")'
  await outputFileAsync('./dist/system/builder-webcomponents-async.js', newFileStr());
  await outputFileAsync('./dist/system/angular/builder-webcomponents-async.js', newFileStr(true));
}

main().catch(err => {
  throw err;
});
