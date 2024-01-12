import { getGlobalThis } from "./get-global-this.js";
function getFetch() {
  const globalFetch = getGlobalThis().fetch;
  if (typeof globalFetch === "undefined") {
    console.warn(`Builder SDK could not find a global fetch function. Make sure you have a polyfill for fetch in your project. 
      For more information, read https://github.com/BuilderIO/this-package-uses-fetch`);
    throw new Error("Builder SDK could not find a global `fetch` function");
  }
  return globalFetch;
}
const fetch = getFetch();
export { fetch }