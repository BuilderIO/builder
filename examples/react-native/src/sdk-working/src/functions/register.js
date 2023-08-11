import { isBrowser } from "./is-browser.js";
const registry = {};
function register(type, info) {
  let typeList = registry[type];
  if (!typeList) {
    typeList = registry[type] = [];
  }
  typeList.push(info);
  if (isBrowser()) {
    const message = {
      type: "builder.register",
      data: {
        type,
        info
      }
    };
    try {
      parent.postMessage(message, "*");
      if (parent !== window) {
        window.postMessage(message, "*");
      }
    } catch (err) {
      console.debug("Could not postmessage", err);
    }
  }
}
export {
  register
};
