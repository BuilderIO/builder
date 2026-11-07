// Webpack workaround to conditionally require certain external modules
// only on the server and not bundle them on the client
let serverOnlyRequire: NodeRequire = (() => null) as any;

// Browsers have no `require`, and a Content Security Policy without 'unsafe-eval'
// reports a violation for this eval on import even though the error is caught.
if (typeof window === 'undefined') {
  try {
    // tslint:disable-next-line:no-eval
    serverOnlyRequire = eval('require');
  } catch (err) {
    // all good
  }
}

export default serverOnlyRequire;
