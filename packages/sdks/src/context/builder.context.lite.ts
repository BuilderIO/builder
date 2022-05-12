import { BuilderContent } from '../types/builder-content.js';
import { ComponentInfo } from '../types/components.js';
import { Nullable } from '../types/typescript.js';
import { createContext } from '@builder.io/mitosis';

export interface RegisteredComponent {
  component: any;
  info: ComponentInfo;
}

interface BuilderContext {
  content: Nullable<BuilderContent>;
  context: Record<string, unknown>;
  state: Record<string, unknown>;
  apiKey: string | null;
  registeredComponents: Record<string, Nullable<RegisteredComponent>>;
}

export default createContext<BuilderContext>({
  content: null,
  context: {},
  state: {},
  apiKey: null,
  registeredComponents: {},
});
