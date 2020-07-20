// Webpack workaround to conditionally require certain external modules
// only on the server and not bundle them on the client
let serverOnlyRequire: NodeRequire;
try {
  // tslint:disable-next-line:no-eval
  serverOnlyRequire = eval('require');
} catch (err) {
  // all good
  serverOnlyRequire = (() => null) as any;
}

export default serverOnlyRequire;
