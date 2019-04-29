import { outputFileAsync, readFileAsync } from 'fs-extra-promise'
const pkg = require('../package.json')

async function main() {
  const [sjs /*systemMain*/] = await Promise.all([
    readFileAsync('./node_modules/systemjs/dist/s.min.js', 'utf8')
    // readFileAsync('./dist/system/builder-webcomponents.js', 'utf8')
  ])
  // TODO: bootstrap script goes here... hmmm...
  // TODO: export basic builder stuff from here so people can use js, or System.import name it hmm
  const newFileStr = [
    // Don't load System.js multiple times...
    `if (typeof System === 'undefined') {${sjs}}`,
    // TODO: get the version of this and load - how does the others do
    /*systemMain*/ `
    if (typeof window === 'undefined' || !window.builderWebcomponentsLoaded) {
      if (typeof window !== 'undefined') {
        window.builderWebcomponentsLoaded = true;
      }
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
      var version = typeof location !== 'undefined' && location.href && getQueryParam(location.href, 'builder.wcVersion') ||  "${pkg.version}";
      System.import('https://cdn.builder.io/js/webcomponents@' + version + '/dist/system/builder-webcomponents.js')
    }
    `.replace(/\s+/g, ' ')
    // `setTimeout(function () { if (typeof location !== 'undefined' && location.hostname === 'shop.galmeetsglam.com') {
    //   var elements = document.getElementsByTagName('builder-component');
    //   for (var i = 0; i < elements.length; i++) {
    //     var element = elements[i];
    //     elements[i].innerHTML = '<div style="text-align:center"><img src="https://static.galmeetsglamcollection.com/static/version1548098907/frontend/MaggyLondon/galmeetsglam/en_US/MaggyLondon_GalMeetsGlam/images/loader.svg" alt="Loading..." style="margin: 30vh auto;"></div>'
    //   }
    // } })`
  ].join(';') // May need to import to initialize: + ';System.import("...")'
  await outputFileAsync('./dist/system/builder-webcomponents-async.js', newFileStr)
}

main().catch(err => {
  throw err
})
