import { evaluate } from "./evaluate.js";
const createEventHandler = (value, options) => (event) => evaluate({
  code: value,
  context: options.context,
  localState: options.localState,
  rootState: options.rootState,
  rootSetState: options.rootSetState,
  event,
  isExpression: false
});
export {
  createEventHandler
};
