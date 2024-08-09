import { assetType, File } from '@bynder/compact-view';

export type AdditionalInformation = {
  selectedFile?: File;
};

type MaybeBynderAsset = BynderAsset | null | undefined;

export type SingleSelectProps = {
  value: MaybeBynderAsset;
  onChange: (value: MaybeBynderAsset) => void;
  mode: 'SingleSelect';
};

type MultiSelectProps = {
  value: BynderAsset[];
  onChange: (value: BynderAsset[]) => void;
  mode: 'MultiSelect';
};

export type SharedProps = {
  context: any;
  assetTypes?: assetType[];
};

export type BynderCompactViewProps = (SingleSelectProps | MultiSelectProps) & SharedProps;

export interface RenderSinglePreviewProps {
  asset?: BynderAsset;
  additionalInfo?: AdditionalInfo;
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
