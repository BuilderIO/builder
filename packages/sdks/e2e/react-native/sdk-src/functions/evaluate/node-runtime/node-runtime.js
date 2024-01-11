var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, {
  enumerable: true,
  configurable: true,
  writable: true,
  value
}) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {})) if (__hasOwnProp.call(b, prop)) __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols) for (var prop of __getOwnPropSymbols(b)) {
    if (__propIsEnum.call(b, prop)) __defNormalProp(a, prop, b[prop]);
  }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
import { fastClone } from "../../fast-clone.js";
import { set } from "../../set.js";
import { getFunctionArguments } from "../helpers.js";
import { safeDynamicRequire } from "./safeDynamicRequire.js";
const ivm = safeDynamicRequire("isolated-vm");
const getSyncValName = key => `bldr_${key}_sync`;
const BUILDER_SET_STATE_NAME = "BUILDER_SET_STATE";
const INJECTED_IVM_GLOBAL = "BUILDER_IVM";
const REF_TO_PROXY_FN = `
var refToProxy = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  return new Proxy({}, {
    get(target, key) {
        if (key === 'copySync') {
          return () => obj.copySync();
        }
        const val = obj.getSync(key);
        if (typeof val?.getSync === 'function') {
            return refToProxy(val);
        }
        return val;
    },
    set(target, key, value) {
        const v = typeof value === 'object' ? new ${INJECTED_IVM_GLOBAL}.Reference(value) : value;
        obj.setSync(key, v);
        ${BUILDER_SET_STATE_NAME}(key, value)
    },
    deleteProperty(target, key) {
        obj.deleteSync(key);
    }
  })
}
`;
const processCode = ({
  code,
  args
}) => {
  const fnArgs = args.map(([name]) => `var ${name} = refToProxy(${getSyncValName(name)}); `).join("");
  return `
${REF_TO_PROXY_FN}
${fnArgs}
function theFunction() {
  ${code}
}

let output = theFunction()

if (typeof output === 'object' && output !== null) {
  output = JSON.stringify(output.copySync ? output.copySync() : output);
}

output;
`;
};
const getIsolateContext = () => {
  const isolate = new ivm.Isolate({
    memoryLimit: 128
  });
  return isolate.createContextSync();
};
const runInNode = ({
  code,
  builder,
  context,
  event,
  localState,
  rootSetState,
  rootState
}) => {
  const state = fastClone(__spreadValues(__spreadValues({}, rootState), localState));
  const args = getFunctionArguments({
    builder,
    context,
    event,
    state
  });
  const isolateContext = getIsolateContext();
  const jail = isolateContext.global;
  jail.setSync("global", jail.derefInto());
  jail.setSync("log", function (...logArgs) {
    console.log(...logArgs);
  });
  jail.setSync(BUILDER_SET_STATE_NAME, function (key, value) {
    set(rootState, key, value);
    rootSetState == null ? void 0 : rootSetState(rootState);
  });
  args.forEach(([key, arg]) => {
    const val = typeof arg === "object" ? new ivm.Reference(key === "builder" ? __spreadProps(__spreadValues({}, arg), {
      getUserAttributes: () => arg.getUserAttributes()
    }) : arg) : null;
    jail.setSync(getSyncValName(key), val);
  });
  jail.setSync(INJECTED_IVM_GLOBAL, ivm);
  const evalStr = processCode({
    code,
    args
  });
  const resultStr = isolateContext.evalSync(evalStr);
  try {
    const res = JSON.parse(resultStr);
    return res;
  } catch (_error) {
    return resultStr;
  }
};
export { runInNode }