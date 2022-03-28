import { createContext } from '@builder.io/mitosis';

interface BuilderContext {
  content: any;
  context: any;
  state: any;
  apiKey: string | null;
}

export default createContext<BuilderContext>({
  content: null,
  context: {},
  state: {},
  apiKey: null,
});
