import { assetType, File, AdditionalInfo, selectionMode } from '@bynder/compact-view';

type BynderAssetFile = { assets?: BynderAsset[]; additionalInfo?: AdditionalInfo };

export type BuilderPluginProps<T> = {
  onChange: (value: T) => void;
  value: T;
  context: any;
};

export type BynderCompactViewProps = BuilderPluginProps<BynderAssetFile> & {
  mode: selectionMode;
  assetTypes?: assetType[];
};

export interface RenderSinglePreviewProps {
  value?: BynderAssetFile;
  onClick: () => void;
  onClear: () => void;
  context: any;
}

// AI-generated types from 3 different Bynder assets, may not be complete, hence the extends Record.
type Capitalize<S extends string> = S extends `${infer F}${infer R}`
  ? `${Uppercase<F>}${Lowercase<R>}`
  : S;

type AssetTypeTitleCase = {
  [K in assetType]: Capitalize<Lowercase<K>>;
}[assetType];

interface BaseAsset extends Record<string, any> {
  __typename: AssetTypeTitleCase;
  id: string;
  name: string;
  description: string | null;
  databaseId: string;
  createdAt: string;
  originalUrl: string | null;
  publishedAt: string;
  tags: string[];
  type: assetType;
  updatedAt: string;
  url: string;
  extensions: string[];
  metaproperties: {
    nodes: any[];
  };
  textMetaproperties: any[]; // You might want to define a more specific type here
  derivatives: {
    thumbnail: string;
    webImage: string;
  };
  files: {
    webImage: File;
    thumbnail: File;
    mini: File;
  };
}

interface ImageAsset extends BaseAsset {
  __typename: 'Image';
  type: 'IMAGE';
}

interface VideoAsset extends BaseAsset {
  __typename: 'Video';
  type: 'VIDEO';
  previewUrls: string[];
}

interface DocumentAsset extends BaseAsset {
  __typename: 'Document';
  type: 'DOCUMENT';
}

export type BynderAsset = ImageAsset | VideoAsset | DocumentAsset;
