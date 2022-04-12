import { createContext } from '@builder.io/mitosis';
import { BuilderContent } from '../types/builder-content';
import { Nullable } from '../types/typescript';

interface BuilderContext {
  content: Nullable<BuilderContent>;
  context: {};
  state: {};
  apiKey: string | null;
}

export default createContext<BuilderContext>({
  content: null,
  context: {},
  state: {},
  apiKey: null,
});
