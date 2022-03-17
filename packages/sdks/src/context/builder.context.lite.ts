import { createContext } from '@builder.io/mitosis';

export default createContext({
  content: null as any,
  context: {} as any,
  state: {} as any,
  apiKey: null as string | null,
});
