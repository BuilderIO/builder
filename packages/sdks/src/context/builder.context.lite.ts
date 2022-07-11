import { BuilderContent } from '../types/builder-content.js';
import { ComponentInfo } from '../types/components.js';
import { Dictionary, Nullable } from '../types/typescript.js';
import { createContext } from '@builder.io/mitosis';

export type RegisteredComponent = ComponentInfo & {
  component: any;
};

export type RegisteredComponents = Dictionary<RegisteredComponent>;

export type BuilderRenderState = Record<string, unknown>;

export type BuilderRenderContext = Record<string, unknown>;

interface BuilderContext {
  content: Nullable<BuilderContent>;
  context: BuilderRenderContext;
  state: BuilderRenderState;
  apiKey: string | null;
  registeredComponents: RegisteredComponents;
}

export default createContext<BuilderContext>({
  content: null,
  context: {},
  state: {},
  apiKey: null,
  registeredComponents: {},
});
