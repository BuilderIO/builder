import { logger } from "../../helpers/logger.js";
import { isBrowser } from "../is-browser.js";
import { isEditing } from "../is-editing.js";
import { isNonNodeServer } from "../is-non-node-server.js";
import { runInNonNode } from "./non-node-runtime/index.js";
function evaluate({
  code,
  context,
  localState,
  rootState,
  rootSetState,
  event,
  isExpression = true
}) {
  if (code === "") {
    logger.warn("Skipping evaluation of empty code block.");
    return;
  }
  const builder = {
    isEditing: isEditing(),
    isBrowser: isBrowser(),
    isServer: !isBrowser()
  };
  const useReturn = isExpression && !(code.includes(";") || code.includes(" return ") || code.trim().startsWith("return "));
  const useCode = useReturn ? `return (${code});` : code;
  const args = {
    useCode,
    builder,
    context,
    event,
    rootSetState,
    rootState,
    localState
  };
  if (isBrowser()) return runInBrowser(args);
  if (isNonNodeServer()) return runInNonNode(args);
  return runInNode(args);
}
const runInBrowser = ({
  useCode,
  builder,
  context,
  event,
  localState,
  rootSetState,
  rootState
}) => {
  const state = flattenState(rootState, localState, rootSetState);
  try {
    return new Function("builder", "Builder", "state", "context", "event", useCode)(builder, builder, state, context, event);
  } catch (e) {
    logger.warn("Builder custom code error: \n While Evaluating: \n ", useCode, "\n", e);
  }
};
const runInNode = args => {
  return runInBrowser(args);
};
function flattenState(rootState, localState, rootSetState) {
  if (rootState === localState) {
    throw new Error("rootState === localState");
  }
  return new Proxy(rootState, {
    get: (_, prop) => {
      if (localState && prop in localState) {
        return localState[prop];
      }
      return rootState[prop];
    },
    set: (_, prop, value) => {
      if (localState && prop in localState) {
        throw new Error("Writing to local state is not allowed as it is read-only.");
      }
      rootState[prop] = value;
      rootSetState == null ? void 0 : rootSetState(rootState);
      return true;
    }
  });
}
export { evaluate, flattenState, runInBrowser, runInNode }