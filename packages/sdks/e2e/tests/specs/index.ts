import { CONTENT as columns } from './columns';
import { CONTENT as homepage } from './homepage';
import { CONTENT as symbols } from './symbols';
import { CONTENT as dataBindings } from './data-bindings';

export const getContentForPathname = () => {
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
