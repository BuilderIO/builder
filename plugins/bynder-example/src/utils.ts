import type { assetType } from '@bynder/compact-view';
import pkg from '../package.json';

export const pluginId = pkg.name;

export const fastClone = <T>(obj: T): T | undefined =>
  obj === undefined ? undefined : JSON.parse(JSON.stringify(obj));

export const BYNDER_URL = 'bynder_URL';
export const BYNDER_LANGUAGE = 'bynder_language';
export const SHOW_ASSET_FIELD_SELECTION = 'showAssetFieldSelection';
export const ASSET_FIELD_SELECTION = 'assetFieldSelection';

export const AssetTypes: assetType[] = ['AUDIO', 'DOCUMENT', 'IMAGE', 'VIDEO'];

// From Bynder documentation
export const SupportedLanguages = ['en_US', 'nl_NL', 'de_DE', 'fr_FR', 'es_ES'] as const;
// Turn the array into a union type
export type SupportedLanguage = (typeof SupportedLanguages)[number];
