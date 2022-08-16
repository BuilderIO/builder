import { CONTENT as columns } from './columns';
import { CONTENT as homepage } from './homepage';
import { CONTENT as symbols } from './symbols';

export const getContentForPathname = () => {
  switch (window.location.pathname) {
    case '/':
      return homepage;
    case '/columns':
      return columns;
    case '/symbols':
      return symbols;
    default:
      return null;
  }
};
