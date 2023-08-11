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
import { flatten } from "../../helpers/flatten.js";
import { getBuilderSearchParamsFromWindow, normalizeSearchParams } from "../get-builder-search-params/index.js";
import { DEFAULT_API_VERSION } from "../../types/api-version.js";
const generateContentUrl = options => {
  const {
    limit = 30,
    userAttributes,
    query,
    noTraverse = false,
    model,
    apiKey,
    includeRefs = true,
    enrich,
    locale,
    apiVersion = DEFAULT_API_VERSION
  } = options;
  if (!apiKey) {
    throw new Error("Missing API key");
  }
  if (!["v2", "v3"].includes(apiVersion)) {
    throw new Error(`Invalid apiVersion: expected 'v2' or 'v3', received '${apiVersion}'`);
  }
  const url = new URL(`https://cdn.builder.io/api/${apiVersion}/content/${model}?apiKey=${apiKey}&limit=${limit}&noTraverse=${noTraverse}&includeRefs=${includeRefs}${locale ? `&locale=${locale}` : ""}${enrich ? `&enrich=${enrich}` : ""}`);
  const queryOptions = __spreadValues(__spreadValues({}, getBuilderSearchParamsFromWindow()), normalizeSearchParams(options.options || {}));
  const flattened = flatten(queryOptions);
  for (const key in flattened) {
    url.searchParams.set(key, String(flattened[key]));
  }
  if (userAttributes) {
    url.searchParams.set("userAttributes", JSON.stringify(userAttributes));
  }
  if (query) {
    const flattened2 = flatten({
      query
    });
    for (const key in flattened2) {
      url.searchParams.set(key, JSON.stringify(flattened2[key]));
    }
  }
  return url;
};
export { generateContentUrl }