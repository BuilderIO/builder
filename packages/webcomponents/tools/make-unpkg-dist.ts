import { outputFileAsync, readFileAsync } from 'fs-extra-promise'
const pkg = require('../package.json')

async function main() {
  const [sjs /*systemMain*/] = await Promise.all([
    readFileAsync('./node_modules/systemjs/dist/s.min.js', 'utf8')
    // readFileAsync('./dist/system/builder-webcomponents.js', 'utf8')
  ])
  // TODO: bootstrap script goes here... hmmm...
  // TODO: export basic builder stuff from here so people can use js, or System.import name it hmm
  const newFileStr =
    `if (typeof window !== 'undefined' && !window.builderWebcomponentsLoaded) {\n` +
    [
      'window.builderWebcomponentsLoaded = true;',
      // Don't load System.js multiple times...
      sjs,
      // TODO: get the version of this and load - how does the others do
      /*systemMain*/ `
      function getQueryParam(url, variable) {
        var query = url.split('?')[1] || '';
        var vars = query.split('&');
        for (let i = 0; i < vars.length; i++) {
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
      System.import('https://cdn.builder.io/js/webcomponents@' + version + '/dist/system/builder-webcomponents.js')
    `.replace(/\s+/g, ' ')
    ].join(';') +
    '}'

  // May need to import to initialize: + ';System.import("...")'
  await outputFileAsync('./dist/system/builder-webcomponents-async.js', newFileStr)
}

main().catch(err => {
  throw err
})
