'use strict'
var __assign =
  (this && this.__assign) ||
  function() {
    __assign =
      Object.assign ||
      function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i]
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p]
        }
        return t
      }
    return __assign.apply(this, arguments)
  }
Object.defineProperty(exports, '__esModule', { value: true })
var __1 = require('graphql-typed-client')

exports.createClient = function(options) {
  var typeMap = __1.linkTypeMap(require('./typeMap.json'))
  return __1.createClient(
    __assign({}, options, {
      queryRoot: typeMap.Query,
      mutationRoot: typeMap.Mutation,
    }),
  )
}
