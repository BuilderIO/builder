import type { BuilderContent } from '../types/builder-content.js';
import type { ComponentInfo } from '../types/components.js';
import type { Dictionary, Nullable } from '../types/typescript.js';

export type RegisteredComponent = ComponentInfo & {
  component: any;
};

export type RegisteredComponents = Dictionary<RegisteredComponent>;

export type BuilderRenderState = Record<string, unknown>;

export type BuilderRenderContext = Record<string, unknown>;

export interface BuilderContextInterface {
  content: Nullable<BuilderContent>;
  context: BuilderRenderContext;
  state: BuilderRenderState;
  apiKey: string | null;
  registeredComponents: RegisteredComponents;
  // Used to recursively store all CSS coming from a parent that would apply to a Text block
  inheritedStyles: Record<string, unknown>;
}
