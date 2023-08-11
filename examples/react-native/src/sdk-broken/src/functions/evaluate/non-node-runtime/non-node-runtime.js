var __defProp = Object.defineProperty;
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
import { logger } from "../../../helpers/logger";
import { set } from "../../set";
import Interpreter from "../acorn-interpreter.js";
const processCode = code => {
  return code.split("\n").map(line => {
    const trimmed = line.trim();
    if (line.includes("__awaiter")) return void 0;
    const isStateSetter = trimmed.startsWith("state.");
    if (!isStateSetter) return line;
    const [lhs, rhs] = trimmed.split("=");
    const setStr = lhs.replace("state.", "").trim();
    const setExpr = `setRootState('${setStr}', ${rhs.trim()})`;
    return `
  ${line}
  ${setExpr}
  `;
  }).filter(Boolean).join("\n");
};
const getJSONValName = val => val + "JSON";
const runInNonNode = ({
  builder,
  context,
  event,
  rootState,
  localState,
  rootSetState,
  useCode
}) => {
  const state = __spreadValues(__spreadValues({}, rootState), localState);
  const properties = {
    state,
    Builder: builder,
    builder,
    context,
    event
  };
  const prependedCode = Object.keys(properties).map(key => `var ${key} = JSON.parse(${getJSONValName(key)});`).join("\n");
  const cleanedCode = processCode(useCode);
  if (cleanedCode === "") {
    logger.warn("Skipping evaluation of empty code block.");
    return;
  }
  const transformed = `
function theFunction() {
  ${prependedCode}

  ${cleanedCode}
}
theFunction();
`;
  const setRootState = (prop, value) => {
    const newState = set(state, prop, value);
    rootSetState == null ? void 0 : rootSetState(newState);
  };
  const initFunc = function (interpreter, globalObject) {
    Object.keys(properties).forEach(key => {
      const val = properties[key] || {};
      const jsonVal = JSON.stringify(val);
      interpreter.setProperty(globalObject, getJSONValName(key), jsonVal);
    });
    interpreter.setProperty(globalObject, "setRootState", interpreter.createNativeFunction(setRootState));
  };
  try {
    const myInterpreter = new Interpreter(transformed, initFunc);
    myInterpreter.run();
    const output = myInterpreter.pseudoToNative(myInterpreter.value);
    return output;
  } catch (e) {
    logger.warn("Custom code error in non-node runtime. SDK can only execute ES5 JavaScript.", {
      e
    });
    return;
  }
};
export { runInNonNode }