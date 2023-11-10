'use strict';
Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
const o = require('isolated-vm'),
  s = (e) => {
    const t = new o.Isolate({ memoryLimit: 128 })
      .createContextSync()
      .evalSync(e);
    try {
      return JSON.parse(t);
    } catch {
      return t;
    }
  };
exports.evaluator = s;
