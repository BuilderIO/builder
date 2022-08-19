import { CONTENT as columns } from './columns';
import { CONTENT as homepage } from './homepage';
import { CONTENT as symbols } from './symbols';
import { CONTENT as dataBindings } from './data-bindings';

// TO-DO: import real content type from SDKs
type BuilderContent = Partial<{ data: { [index: string]: any } }>;

export const getContentForPathname = (): BuilderContent | null => {
  switch (window.location.pathname) {
    case '/':
      return homepage;
    case '/columns':
      return columns;
    case '/symbols':
      return symbols;
    case '/data-bindings':
      return dataBindings;
    default:
      return null;
  }
};
