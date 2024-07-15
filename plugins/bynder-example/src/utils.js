import pkg from "../package.json";
export const pluginId = pkg.name;

export const fastClone = (obj) =>
  obj === undefined ? undefined : JSON.parse(JSON.stringify(obj));

export const BYNDER_URL = "bynder_URL";
export const BYNDER_LANGUAGE = "bynder_language";
export const SHOW_ASSET_FIELD_SELECTION = "showAssetFieldSelection";
export const ASSET_FIELD_SELECTION = "assetFieldSelection";
