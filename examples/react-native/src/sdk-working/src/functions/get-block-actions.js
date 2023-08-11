import { getEventHandlerName } from "./event-handler-name.js";
import { createEventHandler } from "./get-block-actions-handler.js";
function getBlockActions(options) {
  var _a;
  const obj = {};
  const optionActions = (_a = options.block.actions) != null ? _a : {};
  for (const key in optionActions) {
    if (!optionActions.hasOwnProperty(key)) {
      continue;
    }
    const value = optionActions[key];
    obj[getEventHandlerName(key)] = createEventHandler(value, options);
  }
  return obj;
}
export {
  getBlockActions
};
