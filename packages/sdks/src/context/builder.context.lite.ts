import { BuilderContent } from '../types/builder-content.js';
import { Nullable } from '../types/typescript.js';
import { createContext } from '@builder.io/mitosis';

interface BuilderContext {
  content: Nullable<BuilderContent>;
  context: Record<string, unknown>;
  state: Record<string, unknown>;
  apiKey: string | null;
}

export default createContext<BuilderContext>({
  content: null,
  context: {},
  state: {},
  apiKey: null,
});
