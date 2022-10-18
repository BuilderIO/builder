import { CONTENT as columns } from './columns.js';
import { CONTENT as homepage } from './homepage.js';
import { CONTENT as symbols } from './symbols.js';
import { CONTENT as dataBindings } from './data-bindings.js';
import { CONTENT as customBreakpoints } from './custom-breakpoints.js';

// TO-DO: import real content type from SDKs
type BuilderContent = Partial<{ data: { [index: string]: any } }>;

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

function fastClone(object: Object) {
  return JSON.parse(JSON.stringify(object));
}

const getPathnameFromWindow = () => isBrowser() && window.location.pathname;

export const getContentForPathname = (
  pathname = getPathnameFromWindow()
): BuilderContent | null => {
  switch (pathname) {
    case '/':
      return homepage;
    case '/columns':
      return columns;
    case '/symbols':
      return symbols;
    case '/data-bindings':
      return dataBindings;
    case '/custom-breakpoints':
      return customBreakpoints;
    case '/custom-breakpoints-reset':
      const contentWithoutBreakpoints = fastClone(customBreakpoints);
      delete contentWithoutBreakpoints.data!.breakpoints;
      return contentWithoutBreakpoints;
    default:
      return null;
  }
};
