import { SDK_VERSION } from "../constants/sdk-version.js";
import { TARGET } from "../constants/target.js";
import { isBrowser } from "../functions/is-browser.js";
import { register } from "../functions/register.js";
const registerInsertMenu = () => {
  register("insertMenu", {
    name: "_default",
    default: true,
    items: [{
      name: "Box"
    }, {
      name: "Text"
    }, {
      name: "Image"
    }, {
      name: "Columns"
    }, ...(TARGET === "reactNative" ? [] : [{
      name: "Core:Section"
    }, {
      name: "Core:Button"
    }, {
      name: "Embed"
    }, {
      name: "Custom Code"
    }])]
  });
};
let isSetupForEditing = false;
const setupBrowserForEditing = (options = {}) => {
  var _a, _b;
  if (isSetupForEditing) {
    return;
  }
  isSetupForEditing = true;
  if (isBrowser()) {
    (_a = window.parent) == null ? void 0 : _a.postMessage({
      type: "builder.sdkInfo",
      data: {
        target: TARGET,
        version: SDK_VERSION,
        supportsPatchUpdates: false,
        supportsAddBlockScoping: true,
        supportsCustomBreakpoints: true
      }
    }, "*");
    (_b = window.parent) == null ? void 0 : _b.postMessage({
      type: "builder.updateContent",
      data: {
        options
      }
    }, "*");
    window.addEventListener("message", ({
      data
    }) => {
      var _a2, _b2;
      if (!(data == null ? void 0 : data.type)) {
        return;
      }
      switch (data.type) {
        case "builder.evaluate":
          {
            const text = data.data.text;
            const args = data.data.arguments || [];
            const id = data.data.id;
            const fn = new Function(text);
            let result;
            let error = null;
            try {
              result = fn.apply(null, args);
            } catch (err) {
              error = err;
            }
            if (error) {
              (_a2 = window.parent) == null ? void 0 : _a2.postMessage({
                type: "builder.evaluateError",
                data: {
                  id,
                  error: error.message
                }
              }, "*");
            } else {
              if (result && typeof result.then === "function") {
                result.then(finalResult => {
                  var _a3;
                  (_a3 = window.parent) == null ? void 0 : _a3.postMessage({
                    type: "builder.evaluateResult",
                    data: {
                      id,
                      result: finalResult
                    }
                  }, "*");
                }).catch(console.error);
              } else {
                (_b2 = window.parent) == null ? void 0 : _b2.postMessage({
                  type: "builder.evaluateResult",
                  data: {
                    result,
                    id
                  }
                }, "*");
              }
            }
            break;
          }
      }
    });
  }
};
export { registerInsertMenu, setupBrowserForEditing }