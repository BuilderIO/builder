import { TARGET } from "../constants/target.js";
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
    let eventHandlerName = getEventHandlerName(key);
    if (options.stripPrefix) {
      switch (TARGET) {
        case "vue2":
        case "vue3":
          eventHandlerName = eventHandlerName.replace("v-on:", "");
          break;
        case "svelte":
          eventHandlerName = eventHandlerName.replace("on:", "");
          break;
      }
    }
    obj[eventHandlerName] = createEventHandler(value, options);
  }
  return obj;
}
export { getBlockActions }