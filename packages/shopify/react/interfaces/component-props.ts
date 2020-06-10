import { BuilderStore, BuilderElement } from '@builder.io/react';

export interface AssignBlockProps {
  expression?: string;
  builderState?: BuilderStore;
}

export interface CaptureBlockProps {
  expression?: string;
  variableName?: string;
  builderState?: BuilderStore;
}

export interface Branch {
  expression?: string;
  blocks: BuilderElement[];
}

export interface ConditionBlockProps {
  builderState?: BuilderStore;
  builderBlock?: BuilderElement;
  branches: Branch[];
}

export interface UnlessBlockProps {
  builderState?: BuilderStore;
  builderBlock?: BuilderElement;
  unlessBlocks?: BuilderElement[];
  elseBlocks?: BuilderElement[];
  expression?: string;
}

export interface StateProviderProps {
  builderBlock?: BuilderElement;
  state: any;
  context?: any;
}

export interface FormBlockProps {
  customAttributes?: string[];
  type: string;
  parameter?: string;
  builderState?: BuilderStore;
  builderBlock?: BuilderElement;
  showErrors?: boolean;
}
