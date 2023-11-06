import { evaluate } from "./evaluate/index.js";

const createEventHandler = (value, options) => event => evaluate({
  code: value,
  context: options.context,
  localState: options.localState,
  rootState: options.rootState,
  rootSetState: options.rootSetState,
  event,
  isExpression: false
});

export { createEventHandler }