import { getFunctionArguments } from "../helpers.js";

const runInBrowser = ({
  code,
  builder,
  context,
  event,
  localState,
  rootSetState,
  rootState
}) => {
  const functionArgs = getFunctionArguments({
    builder,
    context,
    event,
    state: flattenState(rootState, localState, rootSetState)
  });
  return new Function(...functionArgs.map(([name]) => name), code)(...functionArgs.map(([, value]) => value));
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

export { flattenState, runInBrowser }