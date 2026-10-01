import { createContext } from '@builder.io/mitosis';

export default createContext<{ scriptsEmitted: boolean }>({
  scriptsEmitted: false,
});
